using System.Collections;
using System.Collections.Generic;
using System.Linq;
using Neo4jClient.Transactions;
using Pcon.Models;

namespace Pcon.DAL
{
    public class SkillRepository
    {
        private readonly ITransactionalGraphClient _graphClient;

        public SkillRepository( ITransactionalGraphClient graphClient)
        {
            _graphClient = graphClient;
        }

        public IEnumerable<Profile> AllProfiles()
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
                .Results.OrderBy(p => p.User.Name);

            return profile;
        }

        public Profile GetProfileFromUserName(string userName)
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

        public IEnumerable<Profile> AllUsersWithSkills()
        {
            var profiles = _graphClient.Cypher
                .Match("(ou:OU)<-[:WORKS_IN]-(user:User)-[:HAS_SKILL]->(skill:Skill)")
                .Return((user, ou, skill)
                    => new Profile
                    {
                        User = user.As<User>(),
                        Ou = ou.As<ClientNode>(),
                        Skills = skill.CollectAs<ClientNode>(),
                    }
                )
                .Results.OrderBy(p => p.User.Name);

            return profiles;
        }

        public IEnumerable<Profile> UserHasSkills(string[] skills)
        {
            var profile = _graphClient.Cypher
                .Match("(user:User)-[:HAS_SKILL]->(s) WHERE s.Name IN {skillList}")
                .WithParam("skillList", skills)
                .With("user, s")
                .Match("(user)-[:WORKS_IN]->(ou:OU)")
                .Return((user, s, ou)
                    => new Profile
                    {
                        User = user.As<User>(),
                        Skills = s.CollectAs<ClientNode>(),
                        Ou = ou.As<ClientNode>()
                    }
                )
                .Results.OrderBy(p => p.User.Name);

            return profile;
        }

        public void CreateProfile(Profile profile)
        {
            _graphClient.Cypher
                .Merge("(user:User { UserName: {username} })")
                .OnCreate()
                .Set("user = {newUser}")
                .Merge("(ou:OU {Name: {ouName} })")
                .OnCreate()
                .Set("ou = {profileOu}")
                .CreateUnique("(user)-[:WORKS_IN]->(ou)")
                .ForEach(
                    "(skn in {skillList} | MERGE (sk:Skill {Name: skn.Name }) " +
                    "SET sk = skn CREATE UNIQUE (user)-[:HAS_SKILL]->(sk))")
                .WithParams(new
                {
                    username = profile.User.UserName,
                    newUser = profile.User,
                    ouName = profile.Ou.Name,
                    profileOu = profile.Ou,
                    skillList = profile.Skills
                })
                .ExecuteWithoutResults();
        }

        public void UpdateProfile(Profile profile)
        {
            _graphClient.Cypher
                .Match("()<-[s:HAS_SKILL]-(user:User)-[w:WORKS_IN]->()")
                .Where((User user) => user.UserName == profile.User.UserName)
                .Set("user.Name = {name}")
                .WithParam("name", profile.User.Name)
                .Delete("w")
                .Delete("s")
                .With("user")
                .Merge("(ou:OU {Name: {ouName} })")
                .OnCreate()
                .Set("ou = {profileOu}")
                .CreateUnique("(user)-[:WORKS_IN]->(ou)")
                .ForEach(
                    "(skn in {skillList} | MERGE (sk:Skill {Name: skn.Name }) " +
                    "SET sk = skn CREATE UNIQUE (user)-[:HAS_SKILL]->(sk))")
                .WithParams(new
                {
                    ouName = profile.Ou.Name,
                    profileOu = profile.Ou,
                    skillList = profile.Skills
                })
                .ExecuteWithoutResults();
        }

        public void RemoveProfile(string id)
        {
            _graphClient.Cypher
              .OptionalMatch("(user:User)-[r]->()")
              .Where((User user) => user.UserName == id)
              .Delete("r, user")
              .ExecuteWithoutResults();
        }

        public IEnumerable<ClientNode> OrgSuggest(string query)
        {
            var suggestions = _graphClient.Cypher
                .Match("(ou:OU) WHERE ou.Name =~ { q } ")
                .WithParam("q", "(?i).*" + query + ".*")
                .Return(ou => ou.As<ClientNode>())
                .Results;

            return suggestions;
        }

        public IEnumerable SkillSuggest(string query)
        {
            var suggestions = _graphClient.Cypher
                .Match("(skill:Skill) WHERE skill.Name =~ { q } ")
                .WithParam("q", "(?i).*" + query + ".*")
                .Return(skill => skill.As<ClientNode>())
                .Results;

            return suggestions;
        }
    }
}