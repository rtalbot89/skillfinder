using System.Linq;
using System.Web.Http;
using Pcon.Models;
using System.Web;

namespace Pcon.Api
{
    public class Neo4jController : ApiController
    {
        public IHttpActionResult Get()
        {
            // MATCH(ou: OU) < -[:WORKS_IN] - (user:User) RETURN ou, user
            var graphClient = WebApiConfig.GraphClient;
            var profiles = graphClient.Cypher
                .Match("(ou: OU)<-[:WORKS_IN]-(user:User)")
                .Return((ou, user)
                => new
                {
                    Ou = ou.As<OU>(),
                    users = user.CollectAs<User>()
                })
                .Results;

            return Ok(profiles);
        }
        public IHttpActionResult Get(string id)
        {
            //var userName = HttpContext.Current.User.Identity.Name;
            var graphClient = WebApiConfig.GraphClient;
            var profile = graphClient.Cypher
                .Match("(user:User)-[:HAS_SKILL]->(skill:Skill), (user)-[:WORKS_IN]->(ou: OU)")
                .Where((User user) => user.Name == id)
                .Return((user, skill, ou)
                => new {User = user.As<User>(),
                    Skills = skill.CollectAs<User>(),
                    OU = ou.As<OU>()
                }
                )
                .Results;
            return Ok(profile);
        }

    }

    public class SkillItem
    {
        public string Name { get; set; }
    }
}
