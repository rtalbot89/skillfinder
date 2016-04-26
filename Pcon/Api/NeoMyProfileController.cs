using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Pcon.Models;
using System.Web;
using Neo4jClient.Cypher;

namespace Pcon.Api
{
    [Authorize]
    public class NeoMyProfileController : ApiController
    {
       
        public IHttpActionResult Get()
        {
            var userName = HttpContext.Current.User.Identity.Name;
            var graphClient = WebApiConfig.GraphClient;
            var profile = graphClient.Cypher
                .Match("(user:User)-[:HAS_SKILL]->(skill:Skill), (user)-[:WORKS_IN]->(ou: OU)")
                .Where((User user) => user.UserName == userName)
                .Return((user, skill , ou)
                => new {
                    User = user.As<User>(),
                    Skills = skill.CollectAs<User>(),
                    OU = ou.As<OU>()
                }
                )
                .Results;
            return Ok(profile);
        }


        public IHttpActionResult Post(Profile id)
        {
            var userName = HttpContext.Current.User.Identity.Name;
            var graphClient = WebApiConfig.GraphClient;
            var newUser = new { Name = id.Name, UserName = userName};
            var organisation = new { Name = id.Organisation };
            graphClient.Cypher
                .Merge("(user:User { UserName: {username} })")
                .OnCreate()
                .Set("user = {newUser}")
                .WithParams(new
                {
                    username = userName,
                    newUser
                })
                .ExecuteWithoutResults();

            graphClient.Cypher
               .Merge("(ou: OU{ Name: {name} })")
               .OnCreate()
               .Set("ou = {organisation}")
               .WithParams(new
               {
                   name = organisation.Name,
                   organisation
               })
               .ExecuteWithoutResults();

            graphClient.Cypher
                .Match("(user:User)", "(ou:OU)")
                .Where((User user) => user.Name == id.Name)
                .AndWhere((OU ou) => ou.Name == id.Organisation)
                .CreateUnique("user-[:WORKS_IN]->ou")
                .ExecuteWithoutResults();

            // A rudimentary way of adding skills and relationships
            // Is there a way of avoiding foreach?
            foreach (string s in id.Skills)
            {
                var newSkill = new { Name = s };
                graphClient.Cypher
                    .Match("(user:User)")
                    .Where((User user) => user.UserName == userName)
                    .Merge("(skill:Skill { Name: {name} })")
                    .OnCreate()
                    .Set("skill = {newSkill}")
                    .CreateUnique("user-[:HAS_SKILL]->skill")
                    .WithParams(new
                    {
                        name = newSkill.Name,
                        newSkill
                    })
                    .ExecuteWithoutResults();
            }

            // The statement below works but it seems awkward to use
            /*
            graphClient.Cypher.Create("(n:Skill{param})")
                .WithParam("param", skillList).ExecuteWithoutResults();
            */

            return Ok();
        }

        public IHttpActionResult Put(Profile id)
        {
            // delete skills from profile that have been removed
            var graphClient = WebApiConfig.GraphClient;
            var newUser = new { Name = id.Name };
            var currentSkills = graphClient.Cypher
                .Match("(user:User)-[:HAS_SKILL]->(skill:Skill)")
                .Where((User user) => user.Name == id.Name)
                .Return((skill) => new { Skills = skill.CollectAs<Skill>() }
                ).Results;
            var skillList = currentSkills.ElementAt(0).Skills;

            foreach (var s in skillList)
            {
                if (!id.Skills.ToList().Exists(x => x == s.Name))
                {
                    graphClient.Cypher
                        .Match("(user:User)-[r:HAS_SKILL]->(skill:Skill)")
                        .Where((User user) => user.Name == id.Name)
                        .AndWhere((Skill skill) => skill.Name == s.Name)
                        .Delete("r")
                        .ExecuteWithoutResults();
                }
            }

            // Add new skills
            foreach (var s in id.Skills.ToList())
            {
                if (!skillList.ToList().Exists(x => x.Name == s))
                {
                    var newSkill = new { Name = s };
                    graphClient.Cypher
                        .Match("(user:User)")
                        .Where((User user) => user.Name == id.Name)
                        .Merge("(skill:Skill { Name: {name} })")
                        .OnCreate()
                        .Set("skill = {newSkill}")
                        .CreateUnique("user-[:HAS_SKILL]->skill")
                        .WithParams(new
                        {
                            name = newSkill.Name,
                            newSkill
                        })
                        .ExecuteWithoutResults();
                }
            }
            return Ok();
        }
    }
}
