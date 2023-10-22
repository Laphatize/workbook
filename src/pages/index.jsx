import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState, Fragment } from 'react';
import { Transition, Dialog } from '@headlessui/react';
import { XMarkIcon, HeartIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Footer } from '@/components/Footer';
import { CheckCircleIcon, CheckIcon, FlagIcon } from '@heroicons/react/20/solid';
import { Markdown }  from '@/components/Markdown';
import { app } from '../config/firebaseConfig';

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

const provider = new GoogleAuthProvider();



export default function Challenge() {
  const auth = getAuth();

  
    const router = useRouter()
    const { slug } = router.query

    const NO_PLACE = 'Not placed';
    const [contentPreview, setContentPreview] = useState("");


    async function loginGoogle() {
        const auth = getAuth();
      signInWithPopup(auth, provider)
        .then((result) => {
          result.user.getIdToken().then((idToken) => {
            console.log(idToken);
            localStorage.setItem('idToken', idToken);
            if (localStorage.getItem('username')) {
              // generate a random all lowercase 7 letter username
              var result = '';
              var characters = 'abcdefghijklmnopqrstuvwxyz';
              var charactersLength = characters.length;
              for (var i = 0; i < 7; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
              }
            }
            localStorage.setItem('username', result);
            
        
  
          });
        })
        .catch((error) => {
          // Handle Errors here.
          const errorCode = error.code;
          const errorMessage = error.message;
  
          const credential = GoogleAuthProvider.credentialFromError(error);
          
          window.alert(errorMessage)
        });
    }
  
 
    const [terminalUsername, setTerminalUsername] = useState('...');
    const [terminalPassword, setTerminalPassword] = useState('...');


    let fileurl = ""


    // The Challenge
    useEffect(() => {
      onAuthStateChanged(auth, (user) => {
          fetchActiveTerminals();
      });
        // first fetch active terminals
        const fetchActiveTerminals = async () => {
            var raw = "";

            var requestOptions = {
              method: 'GET',
              redirect: 'follow'
            };
            
            fetch(`${process.env.NEXT_PUBLIC_TERM_URL}Terminal/getAllUserTerminals?jwtToken=${localStorage.getItem("idToken")}`, requestOptions)
              .then(response => response.json())
              .then(result => {
                console.log(result);
                
                

                // handle if empty array
                if (result.length == 0) {
                    
                        try {
                    
                            fetchTerminalData();
                        } catch (err) {
                            console.log(err);
                            setTerminalUsername('Something went wrong.');
                            setTerminalPassword('Something went wrong.');
                        }

                } else {


                    
                    setTerminalUsername(result[0].userName);
                    setTerminalPassword(result[0].password);

                    setTimeout(function () {
                        document.getElementById("termurl").classList.remove("opacity-0");
                        document.getElementById("terminalLoader").classList.add("hidden");
//window.alert(               JSON.stringify(result[0])                        )
                        document.getElementById("termurl").src = result[0].url;

                    }, 10000)

                    
                    document.getElementById("timer").innerText = result[0].minutesRemaining + " minutes";  
                    let minutes = result[0].minutesRemaining;
                    setInterval(function() {
                        // drop minutes
                        if (minutes == 0) {
                            window.alert("Your terminal session has expired. Please refresh the page to start a new session.")
                            window.location.reload();
                        }
                        minutes = minutes - 1;
                        document.getElementById("timer").innerText = minutes + " minutes";


                    }, 60000)
                 
                }
              })
              .catch(error => console.log('error', error));


              // send request



        }

        
        const fetchTerminalData = async () => {
            try {
                console.log("[debug] Creating new container session because nothing was found.")
                var myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                // random 4 digit number
                let code = Math.floor(Math.random() * 9000) + 1000;

                // create a secure random password
                var password = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (var i = 0; i < 10; i++)
                password += possible.charAt(Math.floor(Math.random() * possible.length));
                
                fileurl = "https://file-system-run-qi6ms4rtoa-ue.a.run.app/files/info.zip?id=2222"
                console.log("Injecting file: " + fileurl)

                var raw = JSON.stringify({
                  "jwtToken": localStorage.getItem("idToken"),
                  "TerminalGroupName": "school-class-session", // temp
                  "TerminalID": `${code}`,
                  "classID": "psu58102", // temp
                  "dockerLocation": "ctf_base_wetty_terminal",// temp
                  "injectFileLocation": `${fileurl}`, // temp
                  "maxCpuLimit": "500m",// temp
                  "maxMemoryLimit": "512Mi",// temp
                  "minCpuLimit": "250m",// temp
                  "minMemoryLimit": "256Mi",// temp
                  "terminalUsername": localStorage.getItem("username"),
                  "organizationName": "PSU", // temp
                  "terminalPassword": "",
                  "userID": localStorage.getItem("username"),


                });
                
                var requestOptions = {
                  method: 'POST',
                  headers: myHeaders,
                  body: raw,
                  redirect: 'follow'
                };
                
                fetch(process.env.NEXT_PUBLIC_TERM_URL + "Terminal/createTerminal", requestOptions)
                  .then(response => {
                    response.json();


                  })
                  .then(result => {
                    fetchActiveTerminals();

           
                

                  })
                  .catch(error => console.log('error', error));
            } catch (err) {
                console.log(err);
                setTerminalUsername('Something went wrong.');
                setTerminalPassword('Something went wrong.');
            }
        };

    }, []);

 
// Function to fetch README from GitHub
async function fetchReadme(githubLink) {
  //  const repoPath = githubLink.replace('https://github.com/', '');
    const readmeApiUrl = githubLink;
  
    const response = await fetch(readmeApiUrl, {
      headers: {
        'Accept': 'application/vnd.github.VERSION.raw'
      }
    });
  
    if (response.ok) {
      return await response.text();
    } else {
      throw new Error('Failed to fetch README');
    }
  }
  
  // Function to render Markdown
  function renderMarkdown(markdownText) {
    setContentPreview(markdownText);

  }

  const githubLink = router.query.link

  
  if (githubLink) {
    fetchReadme(githubLink)
      .then(readmeText => {
        renderMarkdown(readmeText);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  

  function askPrompt() {
    let md = window.prompt("Please enter the URL of the markdown file you want to load.");
    window.location.href = "/?link=" + md;
  }
  
    return (<>
        <Head>
            <title>Workbook</title>
            <style>
                @import
                url(&apos;https://fonts.googleapis.com/css2?family=Poppins&display=swap&apos;);
            </style>
        </Head>
        <div className="">

            
            <div id="terminal" className="">
            

                <div className="grid h-screen max-h-screen resize-x grid-cols-2 gap-0 md:grid-cols-2 lg:grid-cols-2"
                >

<div className='px-6 py-4 text-white'>

<div className='flex'>
 <div>
 <h6>Workbook v.0.1</h6>
 </div>
 <div className='ml-auto'>
  <button onClick={loginGoogle} className='bg-neutral-800 px-2 py-1 rounded-lg hover:bg-neutral-700/90'><i className="fab fa-google"></i> Login with Google</button>
  <button onClick={askPrompt} className='ml-2 bg-neutral-800 px-2 py-1 rounded-lg hover:bg-neutral-700/90'>Load Markdown</button>

 </div>
</div>
                        <Markdown content={contentPreview}/>

                    </div>

                    <div className="max-h-screen resize-x overflow-hidden bg-black">
                    <div className="hint mb-2 text-gray-400 px-2 py-2 ">
                    Login as <span className="text-yellow-400">{terminalUsername}</span> using the password <span className="text-yellow-400">{terminalPassword}</span>
                </div>
                    <div className="w-full bg-black text-center mx-auto text-white h-500 py-10"
                        height="500" id="terminalLoader">
                        <center> <div class="terminal-loader"></div></center>
                            <h1 className='text-3xl text-center mt-2'>Initializing your cloud container.</h1>
                         
                        </div>


                   
                        <iframe
                            className="w-full bg-white opacity-0"
                            height="500"
                            id="termurl"
                        ></iframe>
                    </div>

                </div>
            </div>
        </div>
      
    </>)
}