let selectedFileIndex;
let files;

async function getFiles() {
    const response = await fetch("/files", {
      method: "GET"
    });

    return response.json(); 
}

async function loadFile(index) {
    selectedFileIndex = index;
    selectedFile = files[selectedFileIndex];

    const highspeed = document.querySelector('#highspeed').checked;

    const response = await fetch("/load", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ file: selectedFile.path, highspeed })
      });

      document.querySelector('#selected').innerHTML = selectedFile.name;
      document.querySelectorAll(".file").forEach((f) => f.classList.remove("selected"))
      document.querySelector(`#file-${index}`).classList.add('selected');

      if (response.ok) {
        document.querySelector('#status').innerHTML = "OK";	
      } else {
        document.querySelector('#status').innerHTML = "Error";	
      }
  
      return response.json(); 
}

async function reloadFiles() {
    files = await getFiles();

    document.querySelector('#files').innerHTML = files.reduce((acc, file, index) => {
        return acc + `<div id="file-${index}" class="file" value="${file.path}" onclick="loadFile(${index})">${file.name}</div>`;
    }, "");
}

window.onload = async () => {
    await reloadFiles();

    document.querySelector('#highspeed').addEventListener('change', () => {
        loadFile(selectedFileIndex);
    });

    document.querySelector('#reload').addEventListener('click', () => {
        loadFile(selectedFileIndex);
    });

    document.querySelector('#upload_file').addEventListener('change', async (e) => {
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
        await fetch('/upload', {method: "POST", body: formData});
        await reloadFiles();
    });

    document.querySelector('#upload').addEventListener('click', async (e) => {
        document.querySelector('#upload_file').click();
    });
}