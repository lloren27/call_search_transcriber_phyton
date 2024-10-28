import os
from dotenv import load_dotenv
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.llms import OpenAI

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")

llm = OpenAI(api_key=openai_api_key)

prompt_template = PromptTemplate(
    input_variables=["question"],
    template="Based on the knowledge in our database, answer the following question: {question}"
)

chain = LLMChain(llm=llm, prompt=prompt_template)

def query_langchain(question: str) -> str:
    return chain.run(question)
