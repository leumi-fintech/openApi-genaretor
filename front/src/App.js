
import logo from './logo.svg';
import './App.css';
import axios, { post,get } from 'axios';
import React, {useState} from 'react';
function App() {
  return (
    <div className="App">
      <FileUploadPage/>
    </div>
  );
}
var fs = require('fs');
export default App;


function FileUploadPage(){
	const [selectedFile, setSelectedFile] = useState();
	const [isFilePicked, setIsFilePicked] = useState(false);

	const changeHandler = (event) => {
		setSelectedFile(event.target.files[0]);
		console.log(event.target);
		setIsFilePicked(true);
	};

	const handleSubmission = () => {
		const url = 'http://localhost:3001/upload';
		const formData = new FormData();
		formData.append('file',selectedFile)
		const config = {
			headers: {
				'content-type': 'multipart/form-data'
			}
		}
		return  post(url, formData,config)
	};

	return(
   <div>
			<input type="file" name="file" onChange={changeHandler} />
			{isFilePicked ? (
				<div>
					{JSON.stringify(selectedFile)}
					<p>Filename: {selectedFile.name}</p>
					<p>Filetype: {selectedFile.type}</p>
					<p>Size in bytes: {selectedFile.size}</p>
					<p>
						lastModifiedDate:{' '}
						{selectedFile.lastModifiedDate.toLocaleDateString()}
					</p>
				</div>
			) : (
				<p>Select a file to show details</p>
			)}
			<div>
				<button onClick={handleSubmission}>Submit</button>
			</div>
		</div>
	)
}