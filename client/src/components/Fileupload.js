import React, {Fragment, useState} from 'react';
import Message from './Message';
import axios from 'axios';

export const Fileupload = () => {
    const [file, setFile] = useState('');
    const [filename, setFilename] = useState('Choose File');
    const [uploadedFile, setUploadFile] = useState({});
    const [message, setMessage] = useState('');

    const onChange = e => {
        setFile(e.target.files[0]);
        setFilename(e.target.files[0].name);
    }
    const onSubmit = async e =>
    {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);

        try{
            const res = await axios.post('/upload', formData,{
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const {fileName, filePath} = res.data;

            setUploadFile({fileName,filePath});

            setMessage('File uploaded');

        }catch(err){
            if(err.response.status === 500){
                setMessage('There was a problem with the server')
            }else{
                setMessage(err.response.data.msg);
            }
        }
    }
    return (
        <Fragment>
            {message ? <Message msg={message}/> : null}
            <form onSubmit={onSubmit}>
            <div className="custom-file mb-4">
            <input type="file" className="custom-file-input" id="customFile" onChange={onChange}/>
            <label className="custom-file-label" htmlFor="customFile">{filename}</label>
            </div> 

            <input type="submit" value="Upload" className="btn btn-primary btn-block mt-4"></input>
            </form>
        </Fragment>
    )
}

export default Fileupload