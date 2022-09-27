"use strict";

const AWS = require("aws-sdk");
const sharp = require("sharp");

const S3 = new AWS.S3();
const {basename, extname} = require('path')



// Desestruturando o parametro eventos em records, pois podemos receber varios arquivos
module.exports.handle = async ({ Records: records }) => {
  try {
    await Promise.all(
      records.map(async (rec) => {
        const { key } = rec.s3.object;

        const image = await S3.getObject({
          Bucket: process.env.bucket,
          key: key,
        }).promise();

        const optimized = await sharp(image.Body)
        .resize(1280, 720, {fit: 'inside', withoutEnlargement: true})
        .toFormat('jpeg', {progressive: true, quality:50})
        .toBuffer()

        await S3.putObject({
        Body: optimized,
        bucket: process.env.bucket,
        ContentType: 'image/jpeg',
        Key: `compressed/${basename(key, extname(key))}.jpg`
        }).promise();
      })

     
    );
    return {
      statusCode: 201,
      body: {},
    };
  } catch (error) {}
};
