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
                => new
                {
                    user = user.As<User>(),
                    skills = otherskill.CollectAs<User>(),
                    qs = qs.As<User>(),
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

        public IHttpActionResult Post(string[] id)
        {
            //MATCH(u: User) -[:HAS_SKILL]->(a)WHERE a.Name IN["Poetry", "Horse riding"] RETURN u, a
            var graphClient = WebApiConfig.GraphClient;
            if (id.Length > 0)
            {
                var profile = graphClient.Cypher
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
                return Ok(profile);

            }
            else
            {
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
}
