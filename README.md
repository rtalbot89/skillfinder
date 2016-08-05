# skillfinder
A demo ASP.Net MVC application of a network of people connected by skills through a Neo4j graph database. Written as an SPA.
## Stack
* ASP.Net MVC and ASP.Net WebApi
* Neo4j graph database
* Neo4jClient
* AngularJS
* D3
* Font Awesome

## Requirements
* Neo4j database
* Visual Studio 2015

## Run
Get Neo4j up and running. This can be local or remote, e.g. GrapheneDB. In Web.config under appSettings 
edit the database URL, username, and password. If running locally using the default port, you won't need to change the URL.

Build and then start the solution. There won't be anything in the database yet so the graph on the home page will be blank. 
At this point you could just manually add user profiles, or you could import the sample data as described next.

\* If not using the sample data, add a couple of profiles and then add constraints as below.

## Importing sample data
There is sample data in Content/docs as CSV files. An easy way to import the data is to use the Neo4j web browser.

With Skill Finder running you can use the load CSV from URL method to import the sample data from Skill Finder to Neo4j.
Enter the following cypher queries in the Neo4j query editor at the top of the web browser, in sequence:

`LOAD CSV WITH HEADERS FROM "http://localhost:56140/content/docs/users.csv" 
AS line CREATE (:User {Id: line.id, Name: line.Name, UserName: line.UserName})`

`LOAD CSV WITH HEADERS FROM "http://localhost:56140/content/docs/ou.csv" 
AS line CREATE (:OU {Id: line.id, Name: line.Name})`

`LOAD CSV WITH HEADERS FROM "http://localhost:56140/content/docs/skills.csv" 
AS line CREATE (:Skill {Id: line.id, Name: line.Name})`

`LOAD CSV WITH HEADERS FROM "http://localhost:56140/content/docs/has_skill.csv" 
AS line MATCH (user:User { Id: line.user }),(skill:Skill { Id: line.skill}) CREATE (user)-[:HAS_SKILL]->(skill)`

`LOAD CSV WITH HEADERS FROM "http://localhost:56140/content/docs/works_in.csv" 
AS line MATCH (user:User { Id: line.user }),(ou:OU { Id: line.ou}) CREATE (user)-[:WORKS_IN]->(ou)`

## Adding constraints
You will need a couple of constraints. Enter the following in the query editor:

`CREATE CONSTRAINT on (u:User) ASSERT u.UserName IS UNIQUE`

`CREATE CONSTRAINT on (s:Skill) ASSERT s.Name IS UNIQUE`

## Notes
* The Id's on the import data are only for the purpose of import. After that they serve no function.
* There should really be a check for uniqueness of user names when a new profile is created. 
As this is just a demo, it's up to you to ensure that there are no clashes.
