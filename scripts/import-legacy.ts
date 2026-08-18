import path from "node:path";
import fs from "node:fs";
import AdmZip from "adm-zip";
import { PrismaClient, ContentStatus } from "@prisma/client";

type Legacy={model:string;pk:number;fields:Record<string,any>};
const prisma=new PrismaClient();
const zip=new AdmZip(path.resolve("backup.zip"));
const records=JSON.parse(zip.readAsText("backup/online_data.json")) as Legacy[];
const by=(model:string)=>records.filter(r=>r.model===model);
const f=(model:string,id:number)=>by(model).find(r=>r.pk===id)?.fields;
const date=(v:any)=>v?new Date(v):null;
const cleanText=(value:any)=>String(value??"").replace(/\u0000/g,"");
const cleanMediaPath=(value:any)=>value?String(value).split("/").map(part=>part.replace(/[<>:\"|?*]/g,"_")).join("/"):null;
const status=(v:any)=>Number(v)===2?ContentStatus.PUBLISHED:ContentStatus.DRAFT;
const siteIds=new Map(by("sites.site").map(r=>[r.fields.domain,r.pk]));
const userIds=new Map(by("auth.user").map(r=>[r.fields.username,r.pk]));
const foreignId=(value:any,natural:Map<string,number>)=>Array.isArray(value)?natural.get(String(value[0])):value;
const siteId=(value:any)=>foreignId(value,siteIds);
const userId=(value:any)=>value==null?null:foreignId(value,userIds);
const display=(x:any)=>({siteId:siteId(x.site),title:x.title,slug:x.slug||null,metaTitle:x._meta_title||null,description:x.description||"",genDescription:x.gen_description!==false,keywordsString:x.keywords_string||"",created:date(x.created),updated:date(x.updated),status:status(x.status),publishDate:date(x.publish_date),expiryDate:date(x.expiry_date),shortUrl:x.short_url||null,inSitemap:x.in_sitemap!==false});
const profileSlugCounts=new Map<string,number>();
const profileSlug=(slug:any,id:number)=>{if(!slug)return null;const count=profileSlugCounts.get(slug)||0;profileSlugCounts.set(slug,count+1);return count===0?slug:`${slug}-${id}`;};

async function main(){
  console.log("Clearing migrated content…");
  await prisma.$transaction([
    prisma.formFieldEntry.deleteMany(),prisma.formEntry.deleteMany(),prisma.formField.deleteMany(),prisma.form.deleteMany(),prisma.blogPostCategory.deleteMany(),prisma.blogPost.deleteMany(),prisma.blogCategory.deleteMany(),prisma.show.deleteMany(),prisma.extraIncludeDate.deleteMany(),prisma.excludeDate.deleteMany(),prisma.showsMeta.deleteMany(),prisma.playMaker.deleteMany(),prisma.playCast.deleteMany(),prisma.playCrew.deleteMany(),prisma.play.deleteMany(),prisma.theatre.deleteMany(),prisma.profile.deleteMany(),prisma.page.deleteMany(),prisma.siteSetting.deleteMany(),prisma.session.deleteMany(),prisma.user.deleteMany(),prisma.site.deleteMany()
  ]);
  await prisma.site.createMany({data:by("sites.site").map(r=>({id:r.pk,domain:r.fields.domain,name:r.fields.name}))});
  await prisma.user.createMany({data:by("auth.user").map(r=>({id:r.pk,username:r.fields.username,passwordHash:r.fields.password,firstName:r.fields.first_name||"",lastName:r.fields.last_name||"",email:r.fields.email||"",isStaff:r.fields.is_staff,isSuperuser:r.fields.is_superuser,isActive:r.fields.is_active,dateJoined:new Date(r.fields.date_joined),lastLogin:date(r.fields.last_login)}))});
  await prisma.profile.createMany({data:by("person.profile").map(r=>{const x=r.fields;return{id:r.pk,...display(x),slug:profileSlug(x.slug,r.pk),name:x.name,profilePic:cleanMediaPath(x.profile_pic),email:x.email||"",mobile:x.mobile||"",dob:date(x.dob),activeSince:date(x.active_since),linkWebsite:x.link_website||"",linkFacebook:x.link_facebook||"",linkTwitter:x.link_twitter||"",linkInstagram:x.link_instagram||"",bio:x.bio||"",address:x.address||"",ownerId:userId(x.owner)}})});
  await prisma.theatre.createMany({data:by("theatre.theatre").map(r=>{const x=r.fields;return{id:r.pk,...display(x),about:x.about||"",profilePic:cleanMediaPath(x.profile_pic),coverImage:cleanMediaPath(x.cover_image),establishedOn:date(x.established_on),email:x.email||"",phone:x.phone||"",address:x.address||"",closedOn:date(x.closed_on),linkWebsite:x.link_website||"",linkFacebook:x.link_facebook||"",linkTwitter:x.link_twitter||"",linkInstagram:x.link_instagram||""}})});
  await prisma.play.createMany({data:by("play.play").map(r=>{const x=r.fields;return{id:r.pk,...display(x),ratingCount:x.rating_count||0,ratingSum:x.rating_sum||0,ratingAverage:x.rating_average||0,abstract:x.abstract||"",directorialNote:x.directorial_note||"",coverImage:cleanMediaPath(x.cover_image),duration:x.duration,launchedOn:date(x.launched_on),endedOn:date(x.ended_on),isFeatured:!!x.is_featured,theatreId:x.theatre||null}})});
  const credit=(model:string)=>by(model).map(r=>({id:r.pk,order:r.fields._order,playId:r.fields.play,role:r.fields.role,profileId:r.fields.profile}));
  await prisma.playMaker.createMany({data:credit("play.playmaker")});await prisma.playCast.createMany({data:credit("play.playcast")});await prisma.playCrew.createMany({data:credit("play.playcrew")});
  await prisma.showsMeta.createMany({data:by("play.showsmeta").map(r=>{const x=r.fields;return{id:r.pk,playId:x.play,theatreId:x.theatre,startDate:new Date(x.start_date),endDate:new Date(x.end_date),sunday:x.sunday||"",monday:x.monday||"",tuesday:x.tuesday||"",wednesday:x.wednesday||"",thursday:x.thursday||"",friday:x.friday||"",saturday:x.saturday||""}})});
  await prisma.excludeDate.createMany({data:by("play.excludedate").map(r=>({id:r.pk,showId:r.fields.show,date:new Date(r.fields.date)}))});
  await prisma.extraIncludeDate.createMany({data:by("play.extraincludedate").map(r=>({id:r.pk,showId:r.fields.show,date:new Date(r.fields.date),time:r.fields.time||""}))});
  await prisma.show.createMany({data:by("play.shows").map(r=>({id:r.pk,playId:r.fields.play,theatreId:r.fields.theatre,showtime:new Date(r.fields.showtime)}))});
  const rich=new Map(by("pages.richtextpage").map(r=>[r.pk,r.fields.content||""]));
  await prisma.page.createMany({data:by("pages.page").map(r=>{const x=r.fields;return{id:r.pk,...display(x),slug:x.slug,order:x._order||0,contentModel:x.content_model,parentId:x.parent||null,inMenus:x.in_menus||"",loginRequired:!!x.login_required,content:rich.get(r.pk)||"",linkUrl:x.content_model==="link"?x.slug:null}})});
  await prisma.blogCategory.createMany({data:by("blog.blogcategory").map(r=>({id:r.pk,title:r.fields.title,slug:r.fields.slug}))});
  await prisma.blogPost.createMany({data:by("blog.blogpost").map(r=>{const x=r.fields;return{id:r.pk,...display(x),userId:userId(x.user)!,content:x.content||"",allowComments:x.allow_comments!==false,featuredImage:cleanMediaPath(x.featured_image),commentsCount:x.comments_count||0,ratingCount:x.rating_count||0,ratingSum:x.rating_sum||0,ratingAverage:x.rating_average||0}})});
  const joins=by("blog.blogpost").flatMap(r=>(r.fields.categories||[]).map((categoryId:number)=>({postId:r.pk,categoryId})));if(joins.length)await prisma.blogPostCategory.createMany({data:joins,skipDuplicates:true});
  await prisma.form.createMany({data:by("forms.form").map(r=>{const x=r.fields;return{id:r.pk,pageId:r.pk,content:x.content||"",buttonText:x.button_text||"Submit",response:x.response||"",sendEmail:!!x.send_email,emailFrom:x.email_from||"",emailCopies:x.email_copies||"",emailSubject:x.email_subject||"",emailMessage:x.email_message||""}})});
  await prisma.formField.createMany({data:by("forms.field").map(r=>{const x=r.fields;return{id:r.pk,formId:x.form,order:x._order||0,label:x.label,fieldType:x.field_type,required:!!x.required,visible:x.visible!==false,choices:x.choices||"",defaultValue:x.default||"",placeholderText:x.placeholder_text||"",helpText:x.help_text||""}})});
  for(const chunk of chunked(by("forms.formentry"),1000))await prisma.formEntry.createMany({data:chunk.map(r=>({id:r.pk,formId:r.fields.form,entryTime:new Date(r.fields.entry_time)}))});
  for(const chunk of chunked(by("forms.fieldentry"),1000))await prisma.formFieldEntry.createMany({data:chunk.map(r=>({id:r.pk,entryId:r.fields.entry,fieldId:r.fields.field_id,value:cleanText(r.fields.value)}))});
  await prisma.siteSetting.createMany({data:by("conf.setting").map(r=>({id:r.pk,siteId:siteId(r.fields.site),name:r.fields.name,value:String(r.fields.value??"")}))});
  const root=path.resolve("public","uploads");fs.mkdirSync(root,{recursive:true});for(const entry of zip.getEntries()){if(entry.isDirectory||!entry.entryName.startsWith("backup/media/uploads/")||entry.entryName.includes("/.thumbnails/"))continue;const relative=cleanMediaPath(entry.entryName.slice("backup/media/uploads/".length));if(!relative)continue;const target=path.join(root,relative);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,entry.getData());}
  console.log(`Imported ${by("play.play").length} plays, ${by("person.profile").length} profiles, ${by("theatre.theatre").length} theatres and media.`);
}
function chunked<T>(values:T[],size:number){const result:T[][]=[];for(let i=0;i<values.length;i+=size)result.push(values.slice(i,i+size));return result;}
main().finally(()=>prisma.$disconnect());
