import json
import psycopg2
import os
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def get_db_connection():
    """Create and return a database connection using environment variables"""
    try:
        conn = psycopg2.connect(
            host=os.environ['DB_HOST'],
            database=os.environ['DB_NAME'],
            user=os.environ['DB_USER'],
            password=os.environ['DB_PASSWORD'],
            port=os.environ['DB_PORT']
        )
        return conn
    except Exception as e:
        logger.error(f"Error connecting to database: {str(e)}")
        raise e

def lambda_handler(event, context):
    """Main Lambda handler function"""
    try:
        username = event['userName']
        email = event['request']['userAttributes']['email']
        logger.info(f"Catched username: {username} email: {email}")

        # Get database connection
        conn = get_db_connection()
        logger.info("Successfully established database connection")
        
        # Create a cursor
        cur = conn.cursor()
        
        query = "INSERT INTO users (username, email) VALUES (%s, %s)"
        cur.execute(query, (username, email))
        conn.commit()
        
        # Close cursor and connection
        cur.close()
        conn.close()
        logger.info("Database connection closed")
        
        return event
        
    except Exception as e:
        logger.error(f"Error in lambda_handler: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            }),
            'headers': {
                'Content-Type': 'application/json'
            }
        }