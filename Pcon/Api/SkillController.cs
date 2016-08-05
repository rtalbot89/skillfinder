using System.Web.Http;
using Neo4jClient.Transactions;
using Pcon.DAL;

namespace Pcon.Api
{
    // Find profiles with skills
    public class SkillController : ApiController
    {
        private readonly SkillRepository _skillRepository;
      
        public SkillController()
        {
            var graphClient = WebApiConfig.GraphClient;
            _skillRepository = new SkillRepository(graphClient);
        }

        public SkillController(ITransactionalGraphClient graphClient)
        {
            _skillRepository = new SkillRepository(graphClient);
        }

        // Get all profiles and skills
        public IHttpActionResult Get()
        {
            return Ok(_skillRepository.AllUsersWithSkills());
        }

        // From POST return profiles matching an array of skills
        public IHttpActionResult Post(string[] skills)
        {
            return Ok( _skillRepository.UserHasSkills(skills));
        }
    }
}
