using System.Web.Http;
using Pcon.Models;
using Neo4jClient.Transactions;
using Pcon.DAL;

namespace Pcon.Api
{
    public class NeoMyProfileController : ApiController
    {
        private readonly SkillRepository _skillRepository;

        public NeoMyProfileController()
        {
            var graphClient = WebApiConfig.GraphClient;
            _skillRepository = new SkillRepository(graphClient);
        }

        public NeoMyProfileController(ITransactionalGraphClient graphClient)
        {
            _skillRepository = new SkillRepository(graphClient);
        }
        public IHttpActionResult Get()
        {
            var profiles = _skillRepository.AllProfiles();
            return Ok(profiles);
        }
        public IHttpActionResult Get(string id)
        {
            var profile = _skillRepository.GetProfileFromUserName(id);
            return Ok(profile);
        }

        public IHttpActionResult Post(Profile profile)
        {
            var graphClient = WebApiConfig.GraphClient;
            graphClient.Cypher
                .Merge("(user:User { UserName: {username} })")
                .OnCreate()
                .Set("user = {newUser}")
                .Merge("(ou:OU {Name: {ouName} })")
                .OnCreate()
                .Set("ou = {profileOu}")
                .CreateUnique("(user)-[:WORKS_IN]->(ou)")
                .ForEach(
                "(skn in {skillList} | MERGE (sk:Skill {Name: skn.Name }) " +
                "SET sk = skn CREATE UNIQUE (user)-[:HAS_SKILL]->(sk))")
                .WithParams(new
                {
                    username = profile.User.UserName,
                    newUser = profile.User,
                    ouName = profile.Ou.Name,
                    profileOu = profile.Ou,
                    skillList = profile.Skills
                })
                .ExecuteWithoutResults();

            return Ok();
        }

        public IHttpActionResult Put(Profile profile)
        {
            var graphClient = WebApiConfig.GraphClient;

            graphClient.Cypher
                .Match("()<-[s:HAS_SKILL]-(user:User)-[w:WORKS_IN]->()")
                .Where((User user) => user.UserName == profile.User.UserName)
                .Set("user.Name = {name}")
                .WithParam("name", profile.User.Name)
                .Delete("w")
                .Delete("s")
                .With("user")
                .Merge("(ou:OU {Name: {ouName} })")
                .OnCreate()
                .Set("ou = {profileOu}")
                .CreateUnique("(user)-[:WORKS_IN]->(ou)")
                .ForEach(
                "(skn in {skillList} | MERGE (sk:Skill {Name: skn.Name }) " +
                "SET sk = skn CREATE UNIQUE (user)-[:HAS_SKILL]->(sk))")
                 .WithParams(new
                 {
                     ouName = profile.Ou.Name,
                     profileOu = profile.Ou,
                     skillList = profile.Skills
                 })
                .ExecuteWithoutResults();

            return Ok();
        }

        public IHttpActionResult Delete(string id)
        {
            var graphClient = WebApiConfig.GraphClient;
            graphClient.Cypher
                .OptionalMatch("(user:User)-[r]->()")
                .Where((User user) => user.UserName == id)
                .Delete("r, user")
                .ExecuteWithoutResults();
            return Ok();
        }
    }
}
