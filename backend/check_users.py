import mysql.connector
from mysql.connector import Error

try:
    connection = mysql.connector.connect(
        host='127.0.0.1',
        database='reminder_dashboard',
        user='root',
        password='2003'
    )
    
    if connection.is_connected():
        cursor = connection.cursor(dictionary=True)
        
        # Check users
        cursor.execute('SELECT username, email, name, role FROM users')
        users = cursor.fetchall()
        
        print(f'Current users in database: {len(users)}')
        for user in users:
            print(f'- {user["username"]} ({user["email"]}) - {user["role"]}')
        
        cursor.close()
        connection.close()
        
except Error as e:
    print(f'Error: {e}')
