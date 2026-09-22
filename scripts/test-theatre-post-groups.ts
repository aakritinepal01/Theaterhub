import { featuredStoryGroups, featuredReelGroups } from "../src/lib/featured-theatre-media";
import assert from "node:assert/strict";
import { groupTheatrePosts } from "../src/lib/theatre-post-groups";
const post = (id: string, theatreId: number, kind: string, day: number) => ({
  id, kind, caption: id, createdAt: new Date(2026, 8, day),
  theatre: { id: theatreId, title: theatreId === 1 ? "Rangmanch" : "Mandala", slug: String(theatreId) },
  assets: [{ id: id + "b", url: "/video.mp4", mediaType: "video", position: 1 }, { id: id + "a", url: "/photo.jpg", mediaType: "image", position: 0 }],
});
const input = [post("old",1,"STORY",1),post("mandala",2,"STORY",2),post("new",1,"STORY",3),post("reel",2,"REEL",4)];
const stories = groupTheatrePosts(input,"STORY");
assert.deepEqual(stories.map(group=>group.title),["Rangmanch","Mandala"]);
assert.deepEqual(stories[0].stories.map(item=>item.id),["newa","newb","olda","oldb"]);
assert.ok(stories[0].stories.every(item=>item.theatreName === "Rangmanch"));
assert.deepEqual(groupTheatrePosts(input,"REEL").map(group=>group.title),["Mandala"]);
assert.deepEqual(groupTheatrePosts([...input,post("latest",2,"STORY",5)],"STORY").map(group=>group.title),["Mandala","Rangmanch"]);
assert.equal(input[0].id,"old");
assert.deepEqual(groupTheatrePosts([],"STORY"),[]);
console.log("PASS: separate theatre cards, newest card/post first, asset order, story/reel separation, no input mutation.");

assert.equal(featuredStoryGroups.length, 6);
assert.equal(featuredStoryGroups.flatMap(group => group.stories).length, 22);
assert.equal(featuredReelGroups.length, 9);
assert.equal([...stories, ...featuredStoryGroups][0].title, "Rangmanch");
console.log("PASS: all 22 original stories and 9 reels retained; new theatre cards appear first.");
