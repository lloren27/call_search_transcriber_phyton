import os
from dotenv import load_dotenv
from neo4j import GraphDatabase

load_dotenv()

uri = os.getenv("NEO4J_URI")
username = os.getenv("NEO4J_USERNAME")
password = os.getenv("NEO4J_PASSWORD")
driver = GraphDatabase.driver(uri, auth=(username, password))

def run_query(query: str):
    with driver.session() as session:
        result = session.run(query)
        return [record.data() for record in result]

def close_connection():
    driver.close()
