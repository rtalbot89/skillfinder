﻿using System.Collections;
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

        public object GetProfileFromUserName(string userName)
        {
            var profile = _graphClient.Cypher
                .Match("(user:User)-[:HAS_SKILL]->(skill:Skill), (user)-[:WORKS_IN]->(ou: OU)")
                .Where((User user) => user.UserName == userName)
                .Return((user, skill, ou)
                => new {
                    User = user.As<User>(),
                    Skills = skill.CollectAs<User>(),
                    OU = ou.As<OU>()
                }
                )
                .Results;
            return profile;
        }


        public IEnumerable AllUsersWithSkills()
        {
            var profiles = _graphClient.Cypher
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

        public object GetUserWithSkills(string id)
        {
            var profile = _graphClient.Cypher
                .Match("(user:User)-[:HAS_SKILL]->(qs:Skill), (otherskill:Skill)<-[:HAS_SKILL]-(user)-[:WORKS_IN]->(ou: OU)")
                .Where((Skill qs) => qs.Name == id)
                .Return((user, otherskill, ou, qs)
                => new
                {
                    user = user.As<User>(),
                    skills = otherskill.CollectAs<User>(),
                    qs = qs.As<User>(),
                    OU = ou.As<OU>()
                }
                )
                .Results;
            return profile;
        }

        public object UserHasSkills(string[] id)
        {
            var profile =_graphClient.Cypher
               .Match("(user:User)-[:HAS_SKILL]->(s) WHERE s.Name IN {skillList}")
               .WithParam("skillList", id)
               .With("user")
               .Match("(user)-[:HAS_SKILL]->(userskill:Skill)")
               .With("user, userskill")
               .Match("(user)-[:WORKS_IN]->(ou:OU)")
               .Return((user, userskill, ou)
               => new
               {
                   user = user.As<User>(),
                   skills = userskill.CollectAsDistinct<User>(),
                   OU = ou.As<User>()
               }
               )
               .Results;

            return profile;

        }

        public object UsersAllSkills()
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
        public void CreateProfile(Profile id, string userName)
        {

            var newUser = new { Name = id.Name, UserName = userName };
            var organisation = new { Name = id.Organisation };
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
                .Where((User user) => user.Name == id.Name)
                .AndWhere((OU ou) => ou.Name == id.Organisation)
                .CreateUnique("(user)-[:WORKS_IN]->(ou)")
                .ExecuteWithoutResults();

            // A rudimentary way of adding skills and relationships
            // Is there a way of avoiding foreach?
            foreach (var s in id.Skills)
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
    }
}