using System.Web.Http;
using Neo4jClient.Transactions;
using Pcon.DAL;

namespace Pcon.Api
{
    public class SkillSearchController : ApiController
    {
        private readonly SkillRepository _skillRepository;
      
        public SkillSearchController()
        {
            var graphClient = WebApiConfig.GraphClient;
            _skillRepository = new SkillRepository(graphClient);
        }

        public SkillSearchController(ITransactionalGraphClient graphClient)
        {
            _skillRepository = new SkillRepository(graphClient);
        }

        public IHttpActionResult Get(string id)
        {
            var profile = _skillRepository.GetUserWithSkills(id);
            return Ok(profile);
        }

        public IHttpActionResult Get()
        {
            var profiles = _skillRepository.AllUsersWithSkills();
            return Ok(profiles);
        }

        public IHttpActionResult Post(string[] id)
        {
            if (id.Length > 0)
            {
                var profile = _skillRepository.UserHasSkills(id);
                return Ok(profile);
            }

            var profiles = _skillRepository.AllUsersWithSkills();
            return Ok(profiles);
        }
    }
}
