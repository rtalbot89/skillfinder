using System.Web.Http;
using Neo4jClient.Transactions;
using Pcon.DAL;

namespace Pcon.Api
{
    public class AutoSkillsController : ApiController
    {
        private readonly SkillRepository _repository;

        public AutoSkillsController()
        {
            var graphClient = WebApiConfig.GraphClient;
            _repository = new SkillRepository(graphClient);
        }

        public AutoSkillsController(ITransactionalGraphClient graphClient)
        {
            _repository = new SkillRepository(graphClient);
        }

        public IHttpActionResult Get(string query = "")
        {
            var suggestions = _repository.SkillSuggest(query);
            return Ok(suggestions);
        }
    }
}
