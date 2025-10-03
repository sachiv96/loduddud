import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)


def main():
    print("Python project with Supabase is ready!")
    print(f"Connected to Supabase at: {url}")


if __name__ == "__main__":
    main()
