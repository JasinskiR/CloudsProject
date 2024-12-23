import React, { useState, useEffect } from 'react';
import './App.css';
import { Amplify } from 'aws-amplify';
import { awsExports } from './aws-exports';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Auth } from "aws-amplify";
import Chat from './component/Chat';

Amplify.configure({
  Auth: {
    region: awsExports.REGION,
    userPoolId: awsExports.USER_POOL_ID,
    userPoolWebClientId: awsExports.USER_POOL_APP_CLIENT_ID
  }
});

function App() {
  const [jwtToken, setJwtToken] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    fetchJwtToken();
  }, []);
  
  const fetchJwtToken = async () => {
    try {
      const session = await Auth.currentSession();
      const token = session.getIdToken().getJwtToken();
      setJwtToken(token);
    } catch (error) {
      console.log('Error fetching JWT token:', error);
    }
  };
  
  return (
    <Authenticator initialState='signIn'
    components={{
      SignUp: {
        FormFields() {
          return (
            <>
              <Authenticator.SignUp.FormFields />
              {/* Custom fields for given_name and family_name */}
              <div><label>First name</label></div>
              <input
                type="text"
                name="given_name"
                placeholder="Please enter your first name"
              />
              <div><label>Last name</label></div>
              <input
                type="text"
                name="family_name"
                placeholder="Please enter your last name"
              />
              <div><label>Email</label></div>
              <input
                type="text"
                name="email"
                placeholder="Please enter a valid email"
              />
            </>
          );
        },
      },
    }}
    services={{
      async validateCustomSignUp(formData) {
        if (!formData.given_name) {
          return { given_name: 'First Name is required' };
        }
        if (!formData.family_name) {
          return { family_name: 'Last Name is required' };
        }
        if (!formData.email) {
          return { email: 'Email is required' };
        }
      },
    }}
    >
      {({ signOut, user }) => {
        // Set the user email to pass it to the Chat component
        if (user && user.attributes && user.attributes.email !== userEmail) {
          setUserEmail(user.attributes.email);
        }
        
        return (
          <div>
            <button onClick={signOut}>Sign out</button>
            {jwtToken ? (
              <Chat email={userEmail} /> // Pass userEmail to Chat component as email prop
            ) : (
              <div>Loading chat...</div>
            )}
          </div>
        );
      }}
    </Authenticator>
  );
}

export default App;
