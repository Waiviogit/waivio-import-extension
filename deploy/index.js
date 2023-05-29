const archiver = require('archiver');
const fs = require('fs');
const fsp = require('fs/promises');
const AWS = require('aws-sdk');

const FORMATS = ['zip', 'tar'];
const FILE_NAME = 'extension';
const CURRENT_DIR = './deploy/';

const spacesEndpoint = new AWS.Endpoint(process.env.AWS_ENDPOINT);

const s3Zip = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  params: {
    Bucket: 'waivio',
    ACL: 'public-read',
    ContentType: 'application/zip',
  },
});

const s3Tar = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  params: {
    Bucket: 'waivio',
    ACL: 'public-read',
    ContentType: 'application/x-tar',
  },
});

const uploadInS3 = async ({ file, fileName, s3 }) => {
  try {
    return new Promise((resolve) => {
      s3.upload({ Body: file, Key: `${fileName}` }, (err, data) => {
        if (err) {
          resolve({ error: err });
        } if (data) {
          resolve({ url: data.Location });
        }
      });
    });
  } catch (error) {
    return { error };
  }
};

const s3Instance = {
  tar: s3Tar,
  zip: s3Zip,
};

const createZipArchive = async (fileName, format) => new Promise((resolve, reject) => {
  const output = fs.createWriteStream(`${CURRENT_DIR}${fileName}.${format}`);
  const archive = archiver(format, { zlib: { level: 9 } });

  output.on('close', () => {
    console.log(`${format} archive created successfully.`);
    resolve(`${fileName}.${format}`);
  });

  output.on('error', (err) => {
    console.error(`Error creating ${format} archive:`, err);
    reject(err);
  });

  archive.pipe(output);
  archive.directory('./dist', false);
  archive.finalize();
});

const createArchives = async () => {
  const fileNames = [];
  for (const format of FORMATS) {
    const name = await createZipArchive(FILE_NAME, format);
    fileNames.push(name);
  }

  for (const fileName of fileNames) {
    const [, format] = fileName.split('.');
    const file = await fsp.readFile(`${CURRENT_DIR}${fileName}`);

    const { url } = await uploadInS3({
      file, fileName, s3: s3Instance[format],
    });
    console.log(url);
    await fsp.unlink(`${CURRENT_DIR}${fileName}`);
  }
};

(async () => {
  await createArchives();
})();
