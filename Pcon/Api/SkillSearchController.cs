using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Pcon.Models;

namespace Pcon.Api
{
    public class SkillSearchController : ApiController
    {
        public IHttpActionResult Get(string id)
        {
          
            var graphClient = WebApiConfig.GraphClient;
            var profile = graphClient.Cypher
                .Match("(user:User)-[:HAS_SKILL]->(qs:Skill), (otherskill:Skill)<-[:HAS_SKILL]-(user)-[:WORKS_IN]->(ou: OU)")
                .Where((Skill qs) => qs.Name == id)
                .Return((user, otherskill, ou, qs)
                => new {
                    User = user.As<User>(),
                    Skills = otherskill.CollectAs<User>(),
                    qs =qs.As<User>(),
                    OU = ou.As<OU>()
                }
                )
                .Results;
            return Ok(profile);
        }

        //MATCH (user:User)-[r:HAS_SKILL]->(skill:Skill) return user, skill
        public IHttpActionResult Get()
        {
            var graphClient = WebApiConfig.GraphClient;
            var profiles = graphClient.Cypher
                .Match("(user:User)-[:HAS_SKILL]->(skill:Skill)")
                .Return((user, skill) => new
                {
                    user = user.As<User>(),
                    skills = skill.CollectAs<User>()

                }
                )
                .Results;
            return Ok(profiles);

        }
    }
}
