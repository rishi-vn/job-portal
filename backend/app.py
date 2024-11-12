from flask import Flask, request
from flask_cors import CORS
from resume_parser import parse_resume
import os

app = Flask(__name__)
CORS(app)

# Create uploads folder if it doesn't exist
if not os.path.exists('uploads'):
    os.makedirs('uploads')

@app.route('/some-endpoint')
def some_endpoint():
    return "Hello from Flask!"

@app.route('/api/upload-resume', methods=['POST'])
def upload_resume():
    if 'resume' not in request.files:
        return 'No file part', 400
    
    file = request.files['resume']
    if file.filename == '':
        return 'No selected file', 400

    try:
        # Save the file to disk
        file_path = os.path.join('uploads', file.filename)
        file.save(file_path)

        # Parse the uploaded resume
        resume_data = parse_resume(file_path)
        # Process the resume data as needed

        return 'Resume uploaded and parsed successfully'
    except Exception as e:
        print(f"Error: {e}")
        return 'Error uploading file', 500

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)