import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const extensions:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp","image/gif":"gif"};

export async function saveUploadedImage(value:FormDataEntryValue|null,folder:string) {
  if(!(value instanceof File)||value.size===0)return null;
  if(value.size>5*1024*1024)throw new Error("Image must be smaller than 5 MB");
  const extension=extensions[value.type];
  if(!extension)throw new Error("Only JPG, PNG, WebP or GIF images are allowed");
  const directory=path.join(process.cwd(),"public","uploads",folder);
  await mkdir(directory,{recursive:true});
  const filename=`${randomUUID()}.${extension}`;
  await writeFile(path.join(directory,filename),Buffer.from(await value.arrayBuffer()));
  return `/uploads/${folder}/${filename}`;
}
