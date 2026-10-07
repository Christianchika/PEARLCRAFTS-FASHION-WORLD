
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_REGION;
const bucket = process.env.AWS_S3_BUCKET;

if (!region || !bucket) {
  throw new Error("AWS_REGION or AWS_S3_BUCKET is not configured.");
}

export const s3 = new S3Client({
  region,
});

export const S3_BUCKET = bucket;

export const ALLOWED_UPLOAD_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"],
} as const;

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_UPLOAD_FILES = 5;

export function isAllowedUploadType(contentType: string) {
  return Object.prototype.hasOwnProperty.call(
    ALLOWED_UPLOAD_TYPES,
    contentType
  );
}

export async function createUploadUrl(
  key: string,
  contentType: string
) {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3, command, {
    expiresIn: 300,
  });
}

export async function createDownloadUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: key,
  });

  return getSignedUrl(s3, command, {
    expiresIn: 300,
  });
}

export async function deleteS3Object(key: string) {
  return s3.send(
    new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    })
  );
}

export async function getS3ObjectMetadata(key: string) {
  return s3.send(
    new HeadObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    })
  );
}