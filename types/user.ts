export interface User {
  phone: string;
  timezone: string;
  created_at: {
    $date: string;
  };
  email: string;
  name: string;
  profile_pic_url: string;
  profile_pic: string;
}

export interface UserProfileResponse {
  user: User;
}
