import { useEffect, useRef, useState } from "react";
import { Users } from "./Groups";
import { FileText, Plus, X } from "lucide-react";
import { api } from "../utils/api";
import { initializeSocket, receiveMessage, sendMessage, disconnectSocket } from "../utils/socket";
import { UserAddModal } from "./UserModal";
import { getWebContainer } from "../utils/webContainer";
import { WebContainer } from "@webcontainer/api";
import { Editor } from "@monaco-editor/react";
import { getFileNode } from "../utils/getFileNode";
import { debounce } from 'lodash';
import { cleanNestedFileTree, updateFileContentsInTree } from "../utils/cleanNestedFileTree";
import PushToGithub from "./PushToGithub";
import { makePayment } from "../utils/makePayment";

// FileExplorer Component
const FileExplorer = ({ fileTree, setCurrentFile, openFiles, setOpenFiles, setFileTree, parentPath = "" }: {
  fileTree: Record<string, any>;
  setCurrentFile: (file: string) => void;
  openFiles: string[];
  setOpenFiles: (files: string[]) => void;
  setFileTree: (tree: Record<string, any>) => void;
  parentPath?: string;
}) => {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState("");

  const toggleFolder = (folderName: string) => {
    setOpenFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  const handleDoubleClick = (fullPath: string, name: string) => {
    setEditingFile(fullPath);
    setNewFileName(name);
  };

  const handleRename = (oldPath: string) => {
    const lastSlashIndex = oldPath.lastIndexOf('/');
    const parentDir = lastSlashIndex !== -1 ? oldPath.substring(0, lastSlashIndex) : '';
    const newPath = parentDir ? `${parentDir}/${newFileName}` : newFileName;

    // Update fileTree with the new name
    const updatedTree = { ...fileTree };
    const fileContent = { ...updatedTree[oldPath] };
    delete updatedTree[oldPath];
    updatedTree[newPath] = fileContent;

    // Update the file tree in parent component
    setFileTree(updatedTree);

    // Save changes to server
    saveFileTreeDebounced(updatedTree);

    // Update open files if the renamed file was open
    if (openFiles.includes(oldPath)) {
      setOpenFiles(openFiles.map(file => file === oldPath ? newPath : file));
    }

    setEditingFile(null);
  };

  return (
    <div className="p-2">
      {Object.keys(fileTree).map((name) => {
        const item = fileTree[name];
        const fullPath = parentPath ? `${parentPath}/${name}` : name;

        if (item.directory) {
          return (
            <div key={fullPath}>
              <div
                className="flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-700/80 transition-all duration-200"
                onClick={() => toggleFolder(fullPath)}
              >
                <FileText size={16} className="mr-2 text-yellow-400" />
                <span className="text-sm">{name}</span>
              </div>

              {openFolders[fullPath] && (
                <div className="ml-4 border-l pl-2">
                  <FileExplorer
                    fileTree={item.directory}
                    setCurrentFile={setCurrentFile}
                    openFiles={openFiles}
                    setOpenFiles={setOpenFiles}
                    setFileTree={setFileTree}
                    parentPath={fullPath}
                  />
                </div>
              )}
            </div>
          );
        } else {
          return (
            <div
              key={fullPath}
              className="flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-700/80 transition-all duration-200"
              onClick={() => {
                setCurrentFile(fullPath);
                if (!openFiles.includes(fullPath)) {
                  setOpenFiles([...openFiles, fullPath]);
                }
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                handleDoubleClick(fullPath, name);
              }}
            >
              <FileText size={16} className="mr-2 text-gray-300" />
              {editingFile === fullPath ? (
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  onBlur={() => handleRename(fullPath)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRename(fullPath);
                    } else if (e.key === 'Escape') {
                      setEditingFile(null);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  className="bg-gray-600 text-white text-sm px-2 py-1 rounded outline-none"
                />
              ) : (
                <span className="text-sm">{name}</span>
              )}
            </div>
          );
        }
      })}
    </div>
  );
};


type FileNode = {
  file?: { contents: string }; // File structure
  [key: string]: any; // Allow for additional properties
};

type FlatFileTree = Record<string, { file: { contents: string } }>;

const flattenFileTree = (tree: FileNode, parentPath = "") => {
  let flatTree: FlatFileTree = {};
  Object.keys(tree).forEach((key) => {
    const fullPath = parentPath ? `${parentPath}/${key}` : key;
    if (tree[key].file) {
      flatTree[fullPath] = tree[key]; // ✅ Store file content
    } else if (tree[key].directory) {
      Object.assign(flatTree, flattenFileTree(tree[key].directory, fullPath)); // ✅ Recursive flatten
    }
  });
  return flatTree;
};

const Chat = ({ projectId }: { projectId: string }) => {
  const authResult = new URLSearchParams(window.location.search);
  const projectName = authResult.get('name');
  const [messages, setMessages] = useState<{ id: number; text: string; sender: string; name: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userAddModal, setUserAddModal] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<Record<string, { file: { contents: string } }>>({})
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const [openFiles, setOpenFiles] = useState<Array<string>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [webContainer, setWebContainer] = useState<WebContainer | null>(null)
  const [iframeUrl, setIframeUrl] = useState<string | null>(null)
  const [newFileName, setNewFileName] = useState<string>("");
  const [renameFileName, setRenameFileName] = useState<string>("");
  const [fileToRename, setFileToRename] = useState<string | null>(null);
  const [currenProcess, setCurrentProcess] = useState<any>(null)
  const [loading, setLoading] = useState(true);
  const [paymentDone, setPaymentDone] = useState(false)

  /** ✅ Fetch user on mount */
  useEffect(() => {
    api.get('/auth/profile')
      .then((result) => {
        console.log("User Email:", result.data.message.email);
        setUser(result.data.message.email);
      })
      .catch((err) => console.log("Error fetching user:", err));
  }, []);

  /** ✅ Socket Connection with Cleanup */
  useEffect(() => {
    if (!user) return; // Ensure user is loaded before connecting to the socket

    initializeSocket(projectId);

    if (!webContainer) {
      getWebContainer().then((container) => {
        setWebContainer(container)
        console.log("container started", container)
      })
    }

    api.post('/project/get-filetree', {
      projectId: projectId
    }).then((res) => {
      if (res.data && res.data.message && res.data.message.fileTree) {
        setFileTree(res.data.message.fileTree);
      } else {
        console.error("Unexpected response structure:", res.data);
        setFileTree({});
      }
      setLoading(false);
    }).catch((err) => {
      console.log(err);
      setFileTree({});
      setLoading(false);
    });

    receiveMessage("project-message", async (data) => {
      console.log("Received AI response:", data);
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: data.message,
          sender: data.sender,
          name: data.sender == user ? "me" : "others",
        },
      ])
      if (data.message.startsWith("@ai ")) {

        try {
          const payment = await makePayment()
          if (!payment) {
            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: "Insufficient Funds",
                sender: "AI",
                name: "others",
              },
            ]);
            setPaymentDone(false)
            return;
          }
          setPaymentDone(true)
          api.post('/project/get-filetree', {
            projectId: projectId
          }).then(async (res) => {
            // if (res.data && res.data.message && res.data.message.fileTree) {
            //   setFileTree(res.data.message.fileTree);
            // } else {
            //   console.error("Unexpected response structure:", res.data);
            //   setFileTree({});
            // }
            // setLoading(false);
            console.log("HIJIBIJBIJ", res.data.message.fileTree)
            const aiPrompt = `This is the current file tree: ${JSON.stringify(res.data.message.fileTree)}. Now process this request according to the fileTree data: ${data.message.slice(4)}`
            const result = await api.post("/ai", { prompt: aiPrompt });
            console.log("AI FileTree Response:", result.data); // ✅ Debug AI response
            const parsedData = typeof result.data === "string" ? JSON.parse(result.data) : result.data;
            if (parsedData.fileTree) {
              console.log("Flatten: ", flattenFileTree(parsedData.fileTree))
              webContainer?.mount(flattenFileTree(parsedData.fileTree))
              setFileTree(flattenFileTree(parsedData.fileTree)); // ✅ Normalize structure
              saveFileTreeDebounced(flattenFileTree(parsedData.fileTree))
            }

            setMessages((prev) => [
              ...prev,
              {
                id: prev.length + 1,
                text: result.data.text,
                sender: "AI",
                name: "others",
              },
            ]);
          })

        } catch (error) {
          console.log(error)
        }


      }
      if (data.message.startsWith("@git ")) {
        const repo = data.message.slice(5);

        // Store the repo URL in local storage
        localStorage.setItem(`${projectId}_repoUrl`, repo);

        try {
          const response = await api.post('/git/create', {
            repo
          });
          console.log("sdfsdf", response.data);
          webContainer?.mount(response.data);
          setFileTree(response.data);
          saveFileTreeDebounced(response.data);
        } catch (error) {
          console.log("GITHUB ERROR", error);
        }
      }

    });


    return () => {
      console.log("Disconnecting socket...");
      disconnectSocket(); // ✅ Cleanup to avoid duplicate event listeners
    };
  }, [user]); // ✅ Runs only when `user` is available

  /** ✅ Scroll to latest message */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** ✅ Send Message */
  const sendMessageButton = () => {
    if (newMessage.trim() === "") return;
    sendMessage("project-message", { message: newMessage, sender: user as string });
    setNewMessage("");
  };

  const addFile = () => {
    if (newFileName.trim() === "") return;
    const updatedFileTree = {
      ...fileTree,
      [newFileName]: { file: { contents: "" } }, // Create a new file with empty contents
    };
    setFileTree(updatedFileTree);
    setNewFileName(""); // Clear input after adding
  };

  const renameFile = () => {
    if (fileToRename && renameFileName.trim() !== "") {
      const updatedFileTree = { ...fileTree };
      updatedFileTree[renameFileName] = updatedFileTree[fileToRename]; // Copy contents to new name
      delete updatedFileTree[fileToRename]; // Remove old file
      setFileTree(updatedFileTree);
      setFileToRename(null); // Clear the file being renamed
      setRenameFileName(""); // Clear input after renaming
    }
  };


  const saveFileTreeDebounced = debounce((ft) => {
    api.put('/project/save-filetree', {
      projectId: projectId,
      fileTree: ft
    }).then(res => {
      console.log("File saved:", res.data);
    }).catch(err => {
      console.error("Error saving file:", err);
    });
  }, 1000); // Adjust debounce time as needed

  const handleFileChange = async (value: string | undefined) => {
    if (currentFile && value !== undefined) {
      setFileTree(prevTree => updateFileContentsInTree(prevTree, currentFile, value));
      // Optionally, call your debounced save function with the updated tree
      saveFileTreeDebounced(updateFileContentsInTree(fileTree, currentFile, value));
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator
  }

  return (
    <div>
      <PushToGithub
        projectId={projectId}
        fileTree={fileTree}
        paymentDone={paymentDone}
      />
      <div className="w-full relative flex h-screen">
        {/* Chat Interface */}
        <div className={`flex-1 p-4 sm:p-6 flex flex-col transition-all duration-300 ${isModalOpen ? "md:w-2/3" : "w-full"} bg-gray-900 shadow-md`}>
          {/* Header */}
          <div className="flex items-center justify-between py-4 px-4 bg-gray-800 rounded-t-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {/* Online Status Indicator */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></span>
                <img
                  onClick={() => setIsModalOpen(true)}
                  src="/proxy-image/free-vector/businessman-character-avatar-isolated_24877-60111.jpg"
                  alt="User Avatar"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full cursor-pointer shadow-lg"
                />
              </div>
              <span className="text-lg font-semibold text-white">Chat</span>
            </div>

            {/* Add User Button */}
            <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 focus:outline-none transition-all shadow-md" onClick={() => setUserAddModal(true)}>
              <Plus size={20} />
            </button>
          </div>

          {/* Messages Section */}
          <div className="flex flex-col space-y-3 p-4 overflow-y-auto h-full bg-gray-800 rounded-b-lg">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message flex ${msg.name === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`flex flex-col space-y-1 text-md max-w-xs mx-2 ${msg.name === "me" ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-3 rounded-2xl shadow-sm ${msg.name === "me" ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"}`}>
                    <p className={msg.name === "me" ? "text-xs text-blue-200" : "text-xs text-gray-400"}>{msg.sender}</p>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Section */}
          <div className="border-t border-gray-700 px-4 py-3 bg-gray-800 shadow-md rounded-b-lg">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full text-white placeholder-gray-400 px-4 py-3 bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessageButton()}
              />
              <button
                onClick={sendMessageButton}
                className="ml-2 px-5 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 focus:outline-none shadow-lg transition-transform transform hover:scale-105"
              >
                Send
              </button>
            </div>
          </div>
        </div>



        {/* Users Sliding Window */}
        <Users isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} projectName={projectName} />

        {/* User Add Modal */}
        <UserAddModal isOpen={userAddModal} onClose={() => setUserAddModal(false)} projectName={projectName} />


        <section className="bg-gray-900 text-white flex h-screen w-2/3">
          {/* Sidebar - File Explorer */}
          <div className=" bg-gray-800/90 backdrop-blur-md p-4 border-r border-gray-700 shadow-lg">
            <h2 className="text-sm font-semibold mb-3 text-gray-400">EXPLORER</h2>

            {/* Add File Input */}
            <div className="flex mb-2">
              <input
                type="text"
                placeholder="New file name"
                className="flex-1 p-2 rounded-md bg-gray-700 text-white placeholder-gray-400 w-3/4"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
              />
              <button
                className="ml-2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
                onClick={addFile}
              >
                Add
              </button>
            </div>

            {/* Rename File Input */}
            {fileToRename && (
              <div className="flex mb-2">
                <input
                  type="text"
                  placeholder="Rename file"
                  className="flex-1 p-2 rounded-md bg-gray-700 text-white placeholder-gray-400"
                  value={renameFileName}
                  onChange={(e) => setRenameFileName(e.target.value)}
                />
                <button
                  className="ml-2 p-2 bg-green-600 text-white rounded-md hover:bg-green-500 w-3/4"
                  onClick={renameFile}
                >
                  Rename
                </button>
              </div>
            )}

            {/* File Explorer Component */}
            <FileExplorer
              fileTree={fileTree}
              setCurrentFile={setCurrentFile}
              openFiles={openFiles}
              setOpenFiles={setOpenFiles}
              setFileTree={setFileTree}
            />

          </div>

          {/* Main Panel */}
          <div className="flex flex-col flex-1">
            {/* Open File Tabs */}
            {openFiles.length > 0 && (
              <div className="flex items-center bg-gray-800 px-4 border-b border-gray-700">
                {openFiles.map((file) => (
                  <div
                    key={file}
                    className={`flex items-center px-4 py-2 rounded-t-md cursor-pointer transition-all duration-200 ${file === currentFile ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:bg-gray-700"
                      }`}
                    onClick={() => {
                      setCurrentFile(file)
                    }}
                  >
                    <span className="text-sm">{file}</span>
                    <button
                      className="ml-2 text-gray-400 hover:text-red-500 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenFiles(openFiles.filter((item) => item !== file));
                        if (currentFile === file) setCurrentFile(null);
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Code Editor */}
            <div className="flex-1 p-4 bg-gray-900 flex-grow">
              <div className="relative h-[90%]">
                {/* Run Button */}
                <button
                  className="cursor-pointer z-10 absolute right-4 top-9 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-all duration-300"
                  onClick={async () => {
                    try {
                      // Mount the updated fileTree into the container
                      console.log(fileTree)
                      await webContainer?.mount(cleanNestedFileTree(fileTree));
                      // Install dependencies (npm install)
                      const installProcess = await webContainer?.spawn('npm', ['i']);
                      installProcess?.output?.pipeTo(
                        new WritableStream({
                          write(chunk) {
                            console.log("Install output:", chunk);
                          },
                        })
                      );


                      // Register the server-ready event before starting the process.
                      if (installProcess) {

                        if (currenProcess) {
                          currenProcess.kill()
                        }
                        let runProcess = await webContainer?.spawn('npm', ['start']);

                        runProcess?.output?.pipeTo(
                          new WritableStream({
                            write(chunk) {
                              console.log("Run output:", chunk);
                            },
                          })
                        );

                        setCurrentProcess(runProcess)
                      }
                      webContainer?.on('server-ready', (port, url) => {
                        console.log("Server ready on port:", port, "URL:", url);
                        setIframeUrl(url);
                      });

                      // Spawn the new server process (npm start)
                    } catch (error) {
                      console.error("Error during run button execution:", error);
                    }
                  }}
                >
                  ▶
                </button>


                {/* File Name */}
                <h1 className="text-sm font-semibold text-gray-400 mb-2">{currentFile}</h1>

                {/* Code Editor Area */}
                <div className="w-full h-[90%] border border-gray-700 rounded-lg shadow-md">
                  <Editor
                    height="100%"
                    width="100%"
                    language="javascript"
                    className="pt-15"
                    theme="custom-dark"
                    value={
                      currentFile
                        ? getFileNode(fileTree, currentFile)?.file?.contents ?? ""
                        : ""
                    } onChange={handleFileChange}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: 'on',
                      automaticLayout: true,
                      wordWrap: 'on'
                    }}
                    beforeMount={(monaco) => {
                      // Define a custom theme that mimics Tailwind's bg-gray-800 (#1F2937)
                      monaco.editor.defineTheme('custom-dark', {
                        base: 'vs-dark',
                        inherit: true,
                        rules: [],
                        colors: {
                          'editor.background': '#1F2937', // Tailwind bg-gray-800
                          'editor.foreground': '#FFFFFF', // White text
                        },
                      });
                    }}
                  />
                </div>

              </div>
            </div>
          </div>

          {iframeUrl && webContainer &&
            <div className="min-w-200">
              (
              <div className="flex flex-col h-full w-full">
                <div className="address-bar w-full">
                  <input type="text" value={iframeUrl} className="bg-black w-full" onChange={(e) => {
                    setIframeUrl(e.target.value)
                  }} />
                </div>
                <iframe src={iframeUrl} className="w-full h-full bg-white"></iframe>
              </div>
              )
            </div>
          }
        </section>


      </div>
    </div>
  );
};

export default Chat