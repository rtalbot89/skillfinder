using System.Linq;
using System.Web.Http;
using Pcon.Models;

namespace Pcon.Api
{
    public class AutoOrgController : ApiController
    {
        public IHttpActionResult Get(string query = "")
        {
            var graphClient = WebApiConfig.GraphClient;
            var suggestions = graphClient.Cypher
                .Match("(ou:OU) WHERE ou.Name =~ { q } ")
                .WithParam("q", "(?i).*" + query + ".*")
                .Return((ou) => new { OU = ou.CollectAs<OU>() })
                .Results;
            return Ok(suggestions.ToList().ElementAt(0).OU.OrderBy(o => o.Name));
        }
    }
}
