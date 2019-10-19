var readlineAsync = require("readline-async");
var recursive = require("recursive-readdir");
var fs = require("fs");


// cool log
function clj(data) {
  console.log(JSON.stringify(data, undefined, 4));
}

function deleteFile(filepath) {
  fs.unlink(filepath, function (err) {

  });
}


// get the size of one file
function getFilesizeInBytes(filename) {
  const stats = fs.statSync(filename)
  const fileSizeInBytes = stats.size
  return fileSizeInBytes
}

// lit depuis le clavier 
async function readKeyboard() {
  console.log('keep which one ?');
  return readlineAsync().then(line => {
    return line;
  })
}


<<<<<<< HEAD
=======
const path = "d:/path/to/photos";
>>>>>>> 1004f5efc17f452ebecb91fe2f43329cc190f87a

const path = "D:/restore/files/data";

 
let filesBySize = {};
recursive(path, ['tor', '*.txt', '*.jpg'], async function (err, files) {
	
 if(err){
	console.error(err);
 }	 
  // assemble les fichiers par taille
  for (var i in files) {
    let size = getFilesizeInBytes(files[i]);

    if (!filesBySize[size]) {
      filesBySize[size] = [];
    }
    filesBySize[size].push(
      files[i]
    )
  }

  let duplicates = [];
  for (var c in filesBySize) {
    if (filesBySize[c].length > 1) {
		duplicates.push( filesBySize[c]);
	}
  }
  
 
  console.log(duplicates.length + " duplicates");console.log("");
  
  // pour les fichiers de meme taille on ne garde que un seul 
  for (var c in filesBySize) {
    if (filesBySize[c].length > 1) {

      console.log("");console.log("");

      for (var i in filesBySize[c]) {
        console.log(i + " : " + filesBySize[c][i]);
      }
      let keepMe = await readKeyboard();

      if (keepMe != "") {
        // on efface tous les autres doublons sauf celui choisi
        for (var i in filesBySize[c]) {
          if (i != keepMe) {
            deleteFile(filesBySize[c][i])
          }
        }

      }
    }
  }


  console.log("end ",files.length)



});


