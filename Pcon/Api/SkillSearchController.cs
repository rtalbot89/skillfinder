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
                .Match("(user:User)-[:HAS_SKILL]->(skill:Skill), (user)-[:WORKS_IN]->(ou: OU)")
                .Where((Skill skill) => skill.Name == id)
                .Return((user, skill, ou)
                => new {
                    User = user.As<User>(),
                    Skills = skill.CollectAs<User>(),
                    OU = ou.As<OU>()
                }
                )
                .Results;
            return Ok(profile);
        }
    }
}
