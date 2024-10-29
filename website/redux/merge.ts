export const mergeCommunityData = (state, communities) => {
  communities?.forEach((community) => {
    state.data[`community/${community.TitleID}/${community.GameID}`] =
      community;
  });
};

export const mergePostData = (state, posts) => {
  posts?.forEach((post) => {
    state.data[`post/${post.Id}`] = post;
  });
};

export const mergeUserData = (state, users) => {
  users?.forEach((user) => {
    state.data[`user/${user.NNID}`] = user;
  });
};
