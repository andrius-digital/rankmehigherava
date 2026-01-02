import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface SocialMediaFieldsProps {
  yelpLink: string;
  instagramLink: string;
  facebookLink: string;
  tiktokLink: string;
  onYelpChange: (value: string) => void;
  onInstagramChange: (value: string) => void;
  onFacebookChange: (value: string) => void;
  onTiktokChange: (value: string) => void;
}

export const SocialMediaFields = ({
  yelpLink,
  instagramLink,
  facebookLink,
  tiktokLink,
  onYelpChange,
  onInstagramChange,
  onFacebookChange,
  onTiktokChange,
}: SocialMediaFieldsProps) => {
  const socialPlatforms = [
    {
      name: "Yelp",
      value: yelpLink,
      onChange: onYelpChange,
      placeholder: "https://yelp.com/biz/your-business",
      icon: "🔶",
    },
    {
      name: "Instagram",
      value: instagramLink,
      onChange: onInstagramChange,
      placeholder: "https://instagram.com/yourbusiness",
      icon: "📸",
    },
    {
      name: "Facebook",
      value: facebookLink,
      onChange: onFacebookChange,
      placeholder: "https://facebook.com/yourbusiness",
      icon: "👤",
    },
    {
      name: "TikTok",
      value: tiktokLink,
      onChange: onTiktokChange,
      placeholder: "https://tiktok.com/@yourbusiness",
      icon: "🎵",
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-medium">Social Media Links</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Add your social media profiles to include them on your website. Leave blank if you don't have one.
        </p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {socialPlatforms.map((platform) => (
          <div key={platform.name} className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <span>{platform.icon}</span>
              {platform.name}
            </Label>
            <Input
              value={platform.value}
              onChange={(e) => platform.onChange(e.target.value)}
              placeholder={platform.placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialMediaFields;
