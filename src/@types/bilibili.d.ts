// bilibili 原生接口的入参回参类型

declare namespace Bilibili {
  interface BVInfo {
    id: string
  }

  // 视频基本信息
  export interface VideoInfoSchema {
    aid: number
    bvid: string
    cid: number
    title: string
    pic: string
    duration: number
    owner: Owner
    pages: Page[]

    // 视频上传时间
    pubdate: number
  }

  interface Owner {
    mid: number
    name: string
    face: string
  }

  interface Page {
    cid: number
    page: number
    part: string
    duration: number
  }

  // 视频分P信息
  export interface PageInfoSchema {
    dash: {
      duration: number // 视频时长（秒）

      video: Array<{
        id: number
        baseUrl: string
        bandwidth: number // 码率
      }>
      audio: Array<{
        id: number
        baseUrl: string
        bandwidth: number
      }>
    }
    support_formats: Array<{
      quality: number
      new_description: string
    }>
  }

  // 视频作者信息
  export interface UserProfileShchema {
    isLogin: boolean
    email_verified: number
    face: string
    face_nft: number
    face_nft_type: number
    level_info: {
      current_level: number
      current_min: number
      current_exp: number
      next_exp: number
    }
    mid: number
    mobile_verified: number
    money: number
    moral: number
    official: {
      role: number
      title: string
      desc: string
      type: number
    }
    officialVerify: {
      type: number
      desc: string
    }
    pendant: {
      pid: number
      name: string
      image: string
      expire: number
      image_enhance: string
      image_enhance_frame: string
      n_pid: number
    }
    scores: number
    uname: string
    vipDueDate: number
    vipStatus: number
    vipType: number
    vip_pay_type: number
    vip_theme_type: number
    vip_label: {
      path: string
      text: string
      label_theme: string
      text_color: string
      bg_style: number
      bg_color: string
      border_color: string
      use_img_label: boolean
      img_label_uri_hans: string
      img_label_uri_hant: string
      img_label_uri_hans_static: string
      img_label_uri_hant_static: string
    }
    vip_avatar_subscript: number
    vip_nickname_color: string
    vip: {
      type: number
      status: number
      due_date: number
      vip_pay_type: number
      theme_type: number
      label: {
        path: string
        text: string
        label_theme: string
        text_color: string
        bg_style: number
        bg_color: string
        border_color: string
        use_img_label: boolean
        img_label_uri_hans: string
        img_label_uri_hant: string
        img_label_uri_hans_static: string
        img_label_uri_hant_static: string
      }
      avatar_subscript: number
      nickname_color: string
      role: number
      avatar_subscript_url: string
      tv_vip_status: number
      tv_vip_pay_type: number
      tv_due_date: number
      avatar_icon: {
        icon_type: number
      }
    }
    wallet: {
      mid: number
      bcoin_balance: number
      coupon_balance: number
      coupon_due_time: number
    }
    has_shop: boolean
    shop_url: string
    allowance_count: number
    answer_status: number
    is_senior_member: number
    wbi_img: {
      img_url: string
      sub_url: string
    }
    is_jury: boolean
  }

  // up 主卡片信息
  export interface UPCardInfo {
    card: {
      mid: string
      name: string
      approve: boolean
      sex: string
      rank: string
      face: string
      face_nft: number
      face_nft_type: number
      DisplayRank: string
      regtime: number
      spacesta: number
      birthday: string
      place: string
      description: string
      article: number
      // attentions: Array<any>
      fans: number
      friend: number
      attention: number
      sign: string
      level_info: {
        current_level: number
        current_min: number
        current_exp: number
        next_exp: number
      }
      pendant: {
        pid: number
        name: string
        image: string
        expire: number
        image_enhance: string
        image_enhance_frame: string
        n_pid: number
      }
      nameplate: {
        nid: number
        name: string
        image: string
        image_small: string
        level: string
        condition: string
      }
      Official: {
        role: number
        title: string
        desc: string
        type: number
      }
      official_verify: {
        type: number
        desc: string
      }
      vip: {
        type: number
        status: number
        due_date: number
        vip_pay_type: number
        theme_type: number
        label: {
          path: string
          text: string
          label_theme: string
          text_color: string
          bg_style: number
          bg_color: string
          border_color: string
          use_img_label: boolean
          img_label_uri_hans: string
          img_label_uri_hant: string
          img_label_uri_hans_static: string
          img_label_uri_hant_static: string
        }
        avatar_subscript: number
        nickname_color: string
        role: number
        avatar_subscript_url: string
        tv_vip_status: number
        tv_vip_pay_type: number
        tv_due_date: number
        avatar_icon: {
          icon_type: number
        }
        vipType: number
        vipStatus: number
      }
      is_senior_member: number
    }
    space: {
      s_img: string
      l_img: string
    }
    following: boolean
    archive_count: number
    article_count: number
    follower: number
    like_num: number
  }
}
