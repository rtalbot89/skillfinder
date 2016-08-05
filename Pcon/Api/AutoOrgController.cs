using System.Web.Http;
using Neo4jClient.Transactions;
using Pcon.DAL;

namespace Pcon.Api
{
    public class AutoOrgController : ApiController
    {
        private readonly SkillRepository _repository;

        public AutoOrgController()
        {
            var graphClient = WebApiConfig.GraphClient;
            _repository = new SkillRepository(graphClient);
        }

        public AutoOrgController(ITransactionalGraphClient graphClient)
        {
            _repository = new SkillRepository(graphClient);
        }

        public IHttpActionResult Get(string query = "")
        {
            var suggestions = _repository.OrgSuggest(query);
            return Ok(suggestions);
        }
    }
}
