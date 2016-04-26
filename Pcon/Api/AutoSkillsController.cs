using System.Linq;
using System.Web.Http;
using Pcon.Models;

namespace Pcon.Api
{
    public class AutoSkillsController : ApiController
    {
        public IHttpActionResult Get(string query = "")
        {
            var graphClient = WebApiConfig.GraphClient;
            var suggestions = graphClient.Cypher
                .Match("(skill:Skill) WHERE skill.Name =~ { q } ")
                .WithParam("q", "(?i).*" + query + ".*")
                .Return((skill) => new { Skills = skill.CollectAs<Skill>()})
                .Results;
            return Ok(suggestions.ToList().ElementAt(0).Skills.OrderBy(o => o.Name));
        }
    }
}
