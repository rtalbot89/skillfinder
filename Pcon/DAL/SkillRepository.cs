using System.Collections;
using System.Collections.Generic;
using System.Linq;
using Neo4jClient;
using Neo4jClient.Transactions;
using Pcon.Models;

namespace Pcon.DAL
{
    public class SkillRepository
    {
       // public readonly IGraphClient GraphClient;
        private readonly ITransactionalGraphClient _graphClient;


        public SkillRepository( ITransactionalGraphClient graphClient)
        {
            _graphClient = graphClient;
        }

        public IEnumerable AllUsersAndOus()
        {

            var profiles = _graphClient.Cypher
                    .Match("(ou: OU)<-[:WORKS_IN]-(user:User)")
                    .Return((ou, user)
                    => new
                    {
                        Ou = ou.As<OU>(),
                        users = user.CollectAs<User>()
                    })
                    .Results;
            return profiles;
        }

        public object GetProfileFromId(string id)
        {
            var profile = _graphClient.Cypher
                .Match("(user:User)-[:HAS_SKILL]->(skill:Skill), (user)-[:WORKS_IN]->(ou: OU)")
                .Where((User user) => user.Name == id)
                .Return((user, skill, ou)
                    => new
                    {
                        User = user.As<User>(),
                        Skills = skill.CollectAs<User>(),
                        OU = ou.As<OU>()
                    }
                )
                .Results;
            return profile;
        }

        public object AllProfiles()
        {
            var profile = _graphClient.Cypher
                .Match("(user:User)-[:HAS_SKILL]->(skill:Skill), (user)-[:WORKS_IN]->(ou: OU)")
                .Return((user, skill, ou)
                    => new Profile
                    {
                        User = user.As<User>(),
                        Skills = skill.CollectAs<ClientNode>(),
                        Ou = ou.As<ClientNode>()
                    }
                )
                .Results;
            return profile;
        }

        public object GetProfileFromUserName(string userName)
        {
            var profile = _graphClient.Cypher
                .Match("(user:User)-[:HAS_SKILL]->(skill:Skill), (user)-[:WORKS_IN]->(ou: OU)")
                .Where((User user) => user.UserName == userName)
                .Return((user, skill, ou)
                    => new Profile
                    {
                        User = user.As<User>(),
                        Skills = skill.CollectAs<ClientNode>(),
                        Ou = ou.As<ClientNode>()
                    }
                )
                .Results;
            return profile.FirstOrDefault();
        }

        public IEnumerable<object> AllUsersWithSkills()
        {
            var profiles = _graphClient.Cypher
               .Match("(ou:OU)<-[:WORKS_IN]-(user:User)-[:HAS_SKILL]->(skill:Skill)")
               .Return((user, ou, skill) => new
               {
                   user = user.As<User>(),
                   ou = ou.As<ClientNode>(),
                   skills = skill.CollectAs<ClientNode>(),
               }
               )
               .Results;
            return profiles;
        }

        public IEnumerable GetUserWithSkills(string id)
        {
            var profile = _graphClient.Cypher
                .Match("(user:User)-[:HAS_SKILL]->(qs:Skill), (otherskill:Skill)<-[:HAS_SKILL]-(user)-[:WORKS_IN]->(ou: OU)")
                .Where((Skill qs) => qs.Name == id)
                .Return((user, otherskill, ou, qs)
                => new
                {
                    user = user.As<User>(),
                    skills = otherskill.CollectAs<ClientNode>(),
                    qs = qs.As<ClientNode>(),
                    ou = ou.As<ClientNode>()
                }
                )
                .Results;
            return profile;
        }

        public IEnumerable<object> UserHasSkills(string[] skills)
        {
            var profile =_graphClient.Cypher
               .Match("(user:User)-[:HAS_SKILL]->(s) WHERE s.Name IN {skillList}")
               .WithParam("skillList", skills)
               .With("user, s")
                 //.Match("(user)-[:HAS_SKILL]->(userskill:Skill)")
               //.Match("(ou:OU)<-[:WORKS_IN]-(user)-[:HAS_SKILL]->(skill:Skill)")
               //.With("user, userskill")
               .Match("(user)-[:WORKS_IN]->(ou:OU)")
               .Return((user, s, ou)
               => new
               {
                   user = user.As<User>(),
                   skills = s.CollectAs<ClientNode>(),
                   ou = ou.As<ClientNode>()
               }
               )
               .Results;

            return profile;

        }

        public IEnumerable<object> UsersAllSkills()
        {
            var profiles =_graphClient.Cypher
              .Match("(user:User)-[:HAS_SKILL]->(skill:Skill)")
              .Return((user, skill) => new
              {
                  user = user.As<User>(),
                  skills = skill.CollectAs<User>()
              }
              )
              .Results;
           return profiles;

        }
        public void CreateProfile(Profile profile, string userName)
        {

            var newUser = new { profile.User.Name, UserName = userName };
            var organisation = new { Name = profile.Ou.Name };
           _graphClient.Cypher
                .Merge("(user:User { UserName: {username} })")
                .OnCreate()
                .Set("user = {newUser}")
                .WithParams(new
                {
                    username = userName,
                    newUser
                })
                .ExecuteWithoutResults();
           _graphClient.Cypher
               .Merge("(ou: OU{ Name: {name} })")
               .OnCreate()
               .Set("ou = {organisation}")
               .WithParams(new
               {
                   name = organisation.Name,
                   organisation
               })
               .ExecuteWithoutResults();
           _graphClient.Cypher
                .Match("(user:User)", "(ou:OU)")
                .Where((User user) => user.Name == profile.User.Name)
                .AndWhere((OU ou) => ou.Name == profile.Ou.Name)
                .CreateUnique("(user)-[:WORKS_IN]->(ou)")
                .ExecuteWithoutResults();

            // A rudimentary way of adding skills and relationships
            // Is there a way of avoiding foreach?
            foreach (var s in profile.Skills)
            {
                var newSkill = new { Name = s };
               _graphClient.Cypher
                    .Match("(user:User)")
                    .Where((User user) => user.UserName == userName)
                    .Merge("(skill:Skill { Name: {name} })")
                    .OnCreate()
                    .Set("skill = {newSkill}")
                    .CreateUnique("(user)-[:HAS_SKILL]->(skill)")
                    .WithParams(new
                    {
                        name = newSkill.Name,
                        newSkill
                    })
                    .ExecuteWithoutResults();
            }
        }

        public IEnumerable OrgSuggest(string query)
        {
            var suggestions = _graphClient.Cypher
               .Match("(ou:OU) WHERE ou.Name =~ { q } ")
               .WithParam("q", "(?i).*" + query + ".*")
               .Return((ou) => new { OU = ou.CollectAs<OU>() })
               .Results;

            return suggestions.ToList().ElementAt(0).OU.OrderBy(o => o.Name);
        }

        public IEnumerable SkillSuggest(string query)
        {
            var suggestions = _graphClient.Cypher
               .Match("(skill:Skill) WHERE skill.Name =~ { q } ")
               .WithParam("q", "(?i).*" + query + ".*")
               .Return((skill) => new { Skills = skill.CollectAs<Skill>() })
               .Results;

            return suggestions.ToList().ElementAt(0).Skills.OrderBy(o => o.Name);
        }
    }
}