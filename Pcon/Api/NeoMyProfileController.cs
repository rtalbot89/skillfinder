using System;
using System.Collections.Generic;
using System.Drawing.Printing;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Pcon.Models;
using System.Web;
using Neo4jClient.Cypher;
using Neo4jClient.Transactions;
using Pcon.DAL;

namespace Pcon.Api
{
    // [Authorize]
    public class NeoMyProfileController : ApiController
    {
        private readonly SkillRepository _skillRepository;

        public NeoMyProfileController()
        {
            var graphClient = WebApiConfig.GraphClient;
            _skillRepository = new SkillRepository(graphClient);
        }

        public NeoMyProfileController(ITransactionalGraphClient graphClient)
        {
            _skillRepository = new SkillRepository(graphClient);
        }
        public IHttpActionResult Get()
        {
            var profiles = _skillRepository.AllProfiles();
            return Ok(profiles);
        }
        public IHttpActionResult Get(string id)
        {
            var profile = _skillRepository.GetProfileFromUserName(id);
            return Ok(profile);
        }


        public IHttpActionResult Post(Profile profile)
        {
        var graphClient = WebApiConfig.GraphClient;
            graphClient.Cypher
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
            return Ok();
        }

        public IHttpActionResult Put(Profile profile)
        {
            var graphClient = WebApiConfig.GraphClient;
            var newOu = profile.Ou;
            graphClient.Cypher
                .Match("(user:User)-[w:WORKS_IN]->()")
                .Where((User user) => user.UserName == profile.User.UserName)
                .Set("user.Name = {name}")
                .WithParam("name", profile.User.Name)
                .Delete("w")
                .With("user")
                .Merge("(ou:OU {Name: {ouName} })")
                .OnCreate()
                .Set("ou = {profileOu}")
                .WithParams(new
                {
                    ouName = profile.Ou.Name,
                    profileOu = profile.Ou

                })
                .CreateUnique("(user)-[:WORKS_IN]->(ou)")
                .ExecuteWithoutResults();

            var currentSkills = graphClient.Cypher
               .Match("(user:User)-[:HAS_SKILL]->(skill:Skill)")
               .Where((User user) => user.UserName == profile.User.UserName)
               .Return((skill) => new { Skills = skill.CollectAs<ClientNode>() }
               ).Results;

            var skillList = currentSkills.ToList().ElementAt(0).Skills;
            // Remove deleted skills
            foreach (var s in skillList)
            {
                if (!profile.Skills.Contains(s))
                {
                    graphClient.Cypher
                        .Match("(user:User)-[r:HAS_SKILL]->(skill:Skill)")
                        .Where((User user) => user.UserName == profile.User.UserName)
                        .AndWhere((ClientNode skill) => skill.Name == s.Name)
                        .Delete("r")
                        .ExecuteWithoutResults();
                }
            }

            // Add new skills
            foreach (var s in profile.Skills)
            {
                if (!skillList.Contains(s))
                {
                    graphClient.Cypher
                        .Match("(user:User)")
                        .Where((User user) => user.UserName == profile.User.UserName)
                        .Merge("(skill:Skill { Name: {name} })")
                        .OnCreate()
                        .Set("skill = {s}")
                        .CreateUnique("(user)-[:HAS_SKILL]->(skill)")
                        .WithParams(new
                        {
                            name = s.Name,
                            s
                        })
                        .ExecuteWithoutResults();
                }
            }
            return Ok();
        }

        public IHttpActionResult Delete(string id)
        {
            var graphClient = WebApiConfig.GraphClient;
            graphClient.Cypher
                .OptionalMatch("(user:User)-[r]->()")
                .Where((User user) => user.UserName == id)
                .Delete("r, user")
                .ExecuteWithoutResults();
            return Ok();
        }
    }
}
