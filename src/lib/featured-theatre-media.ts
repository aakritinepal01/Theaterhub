import type { TheatreMediaGroup } from "./theatre-post-groups";

// Retain the original homepage collection alongside new theatre uploads.
export const featuredStoryGroups: TheatreMediaGroup[] = (() => {
            const theatreStories = [
              { id: 1000001, title: "Theatre at Kantipur", image: "/story-images/theatre-story-1.jpg", href: "/theatre/" },
              { id: 1000002, title: "Theatre at Kantipur", image: "/story-images/theatre-story-2.jpg", href: "/theatre/" },
              { id: 1000003, title: "Theatre at Kantipur", image: "/story-images/theatre-story-3.jpg", href: "/theatre/" },
            ];
            const secondStories = [
              { id: 1000004, title: "Theatre Workshop", image: "/story-images/theatre-story-4.jpg", href: "/theatre/" },
              { id: 1000005, title: "Theatre Workshop", image: "/story-images/theatre-story-5.jpg", href: "/theatre/" },
              { id: 1000006, title: "Theatre Workshop", image: "/story-images/theatre-story-6.jpg", href: "/theatre/" },
              { id: 1000007, title: "Theatre Workshop", image: "/story-images/theatre-story-7.jpg", href: "/theatre/" },
              { id: 1000008, title: "Theatre Workshop", image: "/story-images/theatre-story-8.jpg", href: "/theatre/" },
            ];
            const thirdStories = [
              { id: 1000009, title: "Theatre Production", image: "/story-images/theatre-story-9.jpg", href: "/theatre/" },
              { id: 1000010, title: "Theatre Production", image: "/story-images/theatre-story-10.jpg", href: "/theatre/" },
              { id: 1000011, title: "Theatre Production", image: "/story-images/theatre-story-11.jpg", href: "/theatre/" },
              { id: 1000012, title: "Theatre Production", image: "/story-images/theatre-story-12.jpg", href: "/theatre/" },
            ];
            const fourthStories = [
              { id: 1000013, title: "Theatre Spotlight", image: "/story-images/theatre-story-13.jpg", href: "/theatre/" },
              { id: 1000014, title: "Theatre Spotlight", image: "/story-images/theatre-story-14.jpg", href: "/theatre/" },
              { id: 1000015, title: "Theatre Spotlight", image: "/story-images/theatre-story-15.jpg", href: "/theatre/" },
              { id: 1000016, title: "Theatre Spotlight", image: "/story-images/theatre-story-16.jpg", href: "/theatre/" },
            ];
            const fifthStories = [
              { id: 1000017, title: "Stage Spaces", image: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=900&q=80", href: "/theatre/" },
              { id: 1000018, title: "Stage Spaces", image: "https://images.unsplash.com/photo-1603190287605-e6ade32fa852?auto=format&fit=crop&w=900&q=80", href: "/theatre/" },
              { id: 1000019, title: "Stage Spaces", image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80", href: "/theatre/" },
            ];
            const sixthStories = [
              { id: 1000020, title: "Behind the Curtain", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80", href: "/theatre/" },
              { id: 1000021, title: "Behind the Curtain", image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=900&q=80", href: "/theatre/" },
              { id: 1000022, title: "Behind the Curtain", image: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&w=900&q=80", href: "/theatre/" },
            ];
            return [{
              id: "photo-story-kantipur",
              title: "TheaterHub Stories",
              stories: theatreStories.slice(0, 3),
            }, {
              id: "photo-story-workshop",
              title: "TheaterHub Stories",
              stories: secondStories,
            }, {
              id: "photo-story-production",
              title: "TheaterHub Stories",
              stories: thirdStories,
            }, {
              id: "photo-story-spotlight",
              title: "TheaterHub Stories",
              stories: fourthStories,
            }, {
              id: "photo-story-spaces",
              title: "TheaterHub Stories",
              stories: fifthStories,
            }, {
              id: "photo-story-curtain",
              title: "TheaterHub Stories",
              stories: sixthStories,
            }];
          })().map(group => ({
  ...group,
  stories: group.stories.map(story => ({ ...story, id: String(story.id), mediaType: "image", theatreName: "TheaterHub" })),
}));

export const featuredReelGroups: TheatreMediaGroup[] = Array.from({ length: 9 }, (_, index) => ({
  id: `featured-reel-${index + 1}`,
  title: "TheaterHub",
  stories: [{ id: `featured-reel-${index + 1}`, title: "TheaterHub", image: `/reels/${index + 1}.mp4`, mediaType: "video", theatreName: "TheaterHub", href: "/theatre/" }],
}));
