import { Button } from "frames.js/next";
import { frames } from "./frames";
import { appURL } from "../utils";

interface State {
  lastFid?: string;
}

const frameHandler = frames(async (ctx) => {
  interface UserData {
  fid: string;
  }

  let userData: UserData | null = null;

  let error: string | null = null;
  let isLoading = false;

  const fetchUserData = async (fid: string) => {
    isLoading = true;
    try {
      const airstackUrl = `${appURL()}/api/profile?userId=${encodeURIComponent(
        fid
      )}`;
      const airstackResponse = await fetch(airstackUrl);
      if (!airstackResponse.ok) {
        throw new Error(
          `Airstack HTTP error! status: ${airstackResponse.status}`
        );
      }
      const airstackData = await airstackResponse.json();

      if (
        airstackData.userData.Socials.Social &&
        airstackData.userData.Socials.Social.length > 0
      ) {
        const social = airstackData.userData.Socials.Social[0];
        userData = {
          fid: social.userId || "N/A"
        };
      } else {
        throw new Error("No user data found");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      error = (err as Error).message;
    } finally {
      isLoading = false;
    }
  };

  const extractFid = (url: string): string | null => {
    try {
      const parsedUrl = new URL(url);
      let fid = parsedUrl.searchParams.get("userfid");

      console.log("Extracted FID from URL:", fid);
      return fid;
    } catch (e) {
      console.error("Error parsing URL:", e);
      return null;
    }
  };

  let fid: string | null = null;

  if (ctx.message?.requesterFid) {
    fid = ctx.message.requesterFid.toString();
    console.log("Using requester FID:", fid);
  } else if (ctx.url) {
    fid = extractFid(ctx.url.toString());
    console.log("Extracted FID from URL:", fid);
  } else {
    console.log("No ctx.url available");
  }

  if (!fid && (ctx.state as State)?.lastFid) {
    fid = (ctx.state as State).lastFid ?? null;
    console.log("Using FID from state:", fid);
  }

  console.log("Final FID used:", fid);

  const shouldFetchData =
    fid && (!userData || (userData as UserData).fid !== fid);


    function flipCoin(): string {
      const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
      return result;
  }
  
  const coinResult = flipCoin();
  
  let imgurl: string;

  if (coinResult === 'Heads') {
      imgurl = "https://wrpcd.net/cdn-cgi/imagedelivery/BXluQx4ige9GuW0Ia56BHw/84745ef9-324d-4c8b-3d7b-c71551664700/original";
      console.log('Heads! Congrats');
  } else {
      imgurl = "https://wrpcd.net/cdn-cgi/imagedelivery/BXluQx4ige9GuW0Ia56BHw/656fa0d5-92a9-4cc0-f53a-fdfd21893900/original";
      console.log('Tails');
  }

  if (shouldFetchData && fid) {
    await Promise.all([fetchUserData(fid)]);
  }
  const SplashScreen = () => (
    <div tw="flex flex-col w-full h-full bg-[#8660cc] text-white font-sans">
    <div tw="flex rounded-lg items-center w-full h-full">
    <img
      src="https://wrpcd.net/cdn-cgi/imagedelivery/BXluQx4ige9GuW0Ia56BHw/90708064-e651-4230-dec0-678bb82db900/original"
    />
</div>
    </div>
  );


  const ScoreScreen = () => {
    return (
      <div tw="flex flex-col w-full h-full bg-white text-black justify-center font-serif font-bold">
      <div tw="flex items-center justify-center">
              <div tw="flex text-7xl mr-10">{coinResult}</div>
                    <img
                      src={imgurl}
                      alt="coin"
                      tw="w-100 h-100 rounded-full"
                    />
              <div tw="flex text-7xl ml-10">{coinResult}</div>
       </div>
       <div tw="flex text-2xl ml-10 mt-10">FID:{userData?.fid}</div>

      </div>
    );
  };
  const shareText = encodeURIComponent(
    `Flip a Coin \n \nframe by @cashlessman.eth`
);

  const shareUrl = `https://warpcast.com/~/compose?text=${shareText}&embeds[]=https://fc-flip-a-coin.vercel.app/frames`;

  const buttons = [];

  if (!userData) {
    buttons.push(
      <Button action="post" target={{ href: `${appURL()}?userfid=${fid}` }}>
        Flip
      </Button>,
      <Button
        action="link"
        // Change the url here
        target={shareUrl}      >
        Share
      </Button>,
      <Button
        action="link"
        target="https://warpcast.com/cashlessman.eth"
      >
        Builder 👤
      </Button>
    );
  } else {
    buttons.push(
      <Button action="post" target={{ href: `${appURL()}?userfid=${fid}` }}>
        Flip
      </Button>,
      <Button action="link" target={shareUrl}>
        Share
      </Button>,
         <Button
         action="link"
         target="https://warpcast.com/cashlessman.eth"
         >
        Builder 👤
        </Button>
      
    );
  }

  return {
    image: fid && !error ? <ScoreScreen /> : <SplashScreen /> ,
    buttons: buttons,
  };
});

export const GET = frameHandler;
export const POST = frameHandler;
