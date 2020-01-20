const readlineAsync = require("readline-async");
const recursive = require("recursive-readdir");
const getSize = require("get-folder-size");
const fs = require("fs");
const fsextra = require("fs-extra");

// cool log
function clj(data) {
  console.log(JSON.stringify(data, undefined, 4));
}

function deleteFile(filepath) {
  fs.unlink(filepath, function(err) {});
}
function deleteFolder(path) {
  fsextra.removeSync(path);
}

function getFileNameFromPath(path) {
  return path.substring(path.lastIndexOf("\\") + 1);
}

function getFolderNameFromPath(path) {
  let folders = path.split("\\");
  return folders[folders.length - 2];
}
function removeFileNameFromPath(path) {
  let filename = getFileNameFromPath(path);
  // c'est bien un fichier,
  if (filename.indexOf(".") >= 0) {
    return path.replace(filename, "");
  } else return path;
}
// get the size of one file
function getFilesizeInBytes(pathtofile) {
  const stats = fs.statSync(pathtofile);
  const fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

const getFolderSize = async path => {
  return await new Promise((resolve, reject) => {
    getSize(path, (err, size) => {
      if (err) {
        reject(err);
      }

      const SIZE_FOLDER = (size / 1024 / 1024).toFixed(2);
      resolve(SIZE_FOLDER);
    });
  });
};

// lit depuis le clavier
async function readKeyboard() {
  return readlineAsync().then(line => {
    return line;
  });
}

const path = "D:/BACKUP/files/data";

(async () => {
  let mode = 0;
  do {
    console.log("/********************************/");
    console.log("/*     duplicate finder         */");
    console.log("/** 1 : by size only            */");
    console.log("/** 2 : by same size and name   */");
    console.log("/** 3 : by folder name and size */");
    console.log("/********************************/");
    mode = await readKeyboard();
  } while (mode != "1" && mode != "2" && mode != "3");

  let filesIndex = {};
  let duplicates = [];
  recursive(path, [], async function(err, files) {
    if (err) {
      console.error(err);
    }

    if (mode == "1" || mode == "2") {
      // assemble les fichiers par taille
      for (var i in files) {
        let size = getFilesizeInBytes(files[i]);
        const key = mode == "1" ? size : getFileNameFromPath(files[i]) + "" + size;

        if (!filesIndex[key]) {
          filesIndex[key] = [];
        }
        filesIndex[key].push(files[i]);
      }
    } else {
      // pour eviter de recalculer la taille d'un même dossier plusieurs fois, clé = path
      let folderSizes = {};
      for (var i in files) {
        // si on veut indexer par nom de dossier il faut découper l'url
        let fullpath = removeFileNameFromPath(files[i]);
        /*console.log("-------------------");

        console.log(files[i]);
        console.log(fullpath);*/
        if (!folderSizes[fullpath]) {
          folderSizes[fullpath] = await getFolderSize(fullpath);
        }

        const folderSize = folderSizes[fullpath];
        const folderName = getFolderNameFromPath(fullpath);

        let key = folderName + "" + folderSize;

        if (!filesIndex[key]) {
          console.log(key);
          filesIndex[key] = new Set();
        }

        filesIndex[key].add(fullpath);
      }

      // on transform le set en array plus simple a utiliser
      for (var c in filesIndex) {
        filesIndex[c] = Array.from(filesIndex[c], x => x);
      }
    }

    for (var c in filesIndex) {
      if (filesIndex[c].length > 1) {
        duplicates.push(filesIndex[c]);
      }
    }
    console.log(duplicates.length + " duplicates");
    console.log("");
    if (duplicates.length > 0) {
      // auto keep only one duplicate
      console.log("auto keep only one duplicate ? type [yes] or any");
      let autoDelete = (await readKeyboard()) === "yes";

      // pour les fichiers de meme taille on ne garde que un seul
      for (var c in filesIndex) {
        if (filesIndex[c].length > 1) {
          if (!autoDelete) {
            console.log("");
            console.log("");

            for (var i in filesIndex[c]) {
              console.log(i + " : " + filesIndex[c][i]);
            }
            console.log("keep which one ? space for ignoring this duplicates");
            let keepMe = await readKeyboard();

            if (keepMe != "") {
              // on efface tous les autres doublons sauf celui choisi
              for (var i in filesIndex[c]) {
                if (i != keepMe) {
                  if (mode != "3") {
                    deleteFile(filesIndex[c][i]);
                  } else {
                    deleteFolder(filesIndex[c][i]);
                  }
                }
              }
            }
          } else {
            for (var j = 1; j < filesIndex[c].length; j++) {
              deleteFile(filesIndex[c][j]);
            }
          }
        }
      }
    }

    console.log("end; files readed : ", files.length);
  });
})();
