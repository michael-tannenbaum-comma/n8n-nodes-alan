# n8n-nodes-alan

This is a community node for [n8n](https://n8n.io/) to interact with [**Alan by Comma Soft**](alan.de).

It allows you to create chats, manage experts, upload files, and manage knowledge bases directly within your workflows.

## Features

* **Authentication:** Support for both Bearer Token (JWT) and API Keys
* **Chats:**
    * Create chats with specific Experts
    * Select Knowledge Bases for RAG (Retrieval Augmented Generation)
    * **API Only Mode:** Keep automated chats out of your UI history
    * Stream-Parser included (outputs clean JSON instead of raw SSE streams)
* **Experts:** Create new Experts
* **Files:** Upload files (PDF, txt, etc.) to Alan
* **Knowledge Bases:**
    * Create new Knowledge Bases
    * Add files to existing Knowledge Bases.

## Installation

### Option 1: Installation from Release (Recommended)
Currently, the node is not yet published to the public NPM registry. You can install it manually:

1. Download the file `n8n-nodes-alan.zip` from the latest [Release](../../releases). 
   *(Do NOT download "Source code", download the specific zip file).*
2. Open your n8n custom nodes directory:
   * Linux/Mac: `~/.n8n/custom/`
   * Docker: Ensure this folder is mapped to `/home/node/.n8n/custom/` inside the container.
3. Create a folder named `n8n-nodes-alan` inside `custom`.
4. Extract the contents of the zip file into this new folder.
   * You should see `package.json` and a `dist` folder directly inside.
5. Restart n8n

### Option 2: Self-built
1. Clone this repository.
2. Run `npm install` and `npm run build`.
3. Link the folder to your n8n custom nodes directory (e.g., `~/.n8n/custom/`).

## Usage

### Chat Operation
* **Resource:** Chat
* **Operation:** Create & Generate
* **API Only:** Set to `true` (default) to hide this chat from the user history in the Alan web interface.

### File Upload & RAG
To use a file in a chat:
1. Use the **File -> Upload** operation to upload a binary file.
2. Use the **Knowledge Base -> Add File** operation to link the uploaded file ID to a Knowledge Base.
3. In your **Chat** node, select that Knowledge Base in the Dropdown.

## Contribution

Contributions are welcome! If you want to add new API endpoints, fix bugs, or improve the documentation, feel free to open a Pull Request.

### Development Setup

To work on this node locally, you need **Node.js** and **n8n** installed.

1. Clone the repository:

   ```bash
   git clone https://github.com/michael-tannenbaum-comma/n8n-nodes-alan.git
   cd n8n-nodes-alan
   ```

2.  Install & Build:

    ```bash
    npm install
    npm run build
    ```

3.  To install the node in n8n, you can either link the folder or simply copy it:

    **Option A: Symbolic Link**
    Create a symbolic link so changes are reflected immediately after a rebuild.

    ```bash
    # Linux / Mac
    mkdir -p ~/.n8n/custom
    ln -s "$(pwd)" ~/.n8n/custom/n8n-nodes-alan
    ```

    **Option B: Manual Copy**
    Simply copy the whole project folder into your n8n custom directory.

      * Copy the folder `n8n-nodes-alan` to `~/.n8n/custom/`.
      * *Note:* You need to copy it again every time you make changes and rebuild.

4.  Restart your local n8n instance and test your changes:

    ```bash
    n8n start
    ```

