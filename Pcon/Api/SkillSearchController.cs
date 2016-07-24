using System.Web.Http;
using Neo4jClient.Transactions;
using Pcon.DAL;

namespace Pcon.Api
{
    // Find profiles with skills
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

        //Return a single profile from a query for one skill
        //public IHttpActionResult Get(string id)
        //{
        //    var profile = _skillRepository.GetUserWithSkills(id);
        //    return Ok(profile);
        //}

        // Get all profiles and skills
        public IHttpActionResult Get()
        {
            var profiles = _skillRepository.AllUsersWithSkills();
            return Ok(profiles);
        }

        // From POST return profiles matching a selection of skills
        // or all users and skills if the list of skills is empty
        public IHttpActionResult Post(string[] skills)
        {
            return Ok(skills.Length > 0 ? _skillRepository.UserHasSkills(skills) : _skillRepository.AllUsersWithSkills());
        }
    }
}
