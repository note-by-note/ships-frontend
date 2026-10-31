// The policies in Simplified Chinese (Mandarin): a translation of en.tsx,
// which is the version that applies. Students and mentors are "你"; the parent
// consent page speaks to parents as "您". Names of buttons and pages on the
// site, which is in English, are given in English where people need to find
// them.
//
// Each paragraph stays on one line: JSX turns a line break into a space, and
// Chinese doesn't put spaces between words.

import Link from 'next/link';
import { policyHref } from '@/lib/policy-languages';
import type { PolicySet } from './types';

const to = (path: string) => policyHref(path, 'zh');

export const zh: PolicySet = {
  chrome: {
    names: {
      conduct: '行为准则',
      terms: '使用条款',
      privacy: '隐私政策',
      consent: '家长和监护人同意书',
    },
    policiesLabel: '政策',
    languageLabel: '语言',
    lastUpdated: (date) => `最后更新：${date}`,
    onThisPage: '本页内容',
    translationNote: '这是译文。如与英文版有出入，以英文版为准。',
    readInEnglish: '阅读英文版',
  },

  conduct: {
    title: '行为准则',
    description: '在 Note by Note，学生、家庭、导师和志愿者应如何相处。',
    summary: (
      <p>Note by Note 能够运作，是因为学生、家庭和志愿者彼此信任。本准则适用于所有拥有账户的人：学生、家长和监护人、导师，以及各个团队的志愿者。</p>
    ),
    sections: [
      {
        id: 'respect',
        title: '尊重每一个人',
        body: (
          <>
            <p>待人友善，保持耐心。不允许骚扰、霸凌或歧视，无论是基于种族、民族、宗教、性别、性别认同、性取向、残疾、年龄、出身还是音乐水平。</p>
            <p>反馈应针对音乐，而不是针对人。欢迎各种音乐风格，也欢迎从任何起点开始学习的人。</p>
          </>
        ),
      },
      {
        id: 'reliable',
        title: '遵守课程安排',
        body: (
          <>
            <p>准时参加你约定的课程。如果无法参加某节课，请尽早在<Link href="/dashboard/lessons">课程页面</Link>（Lessons）告诉对方。</p>
            <p>如果你需要停止上课，请告诉你的导师或学生，并通过<Link href="/contact">联系页面</Link>告知团队，这样就不会有人一直等待。</p>
          </>
        ),
      },
      {
        id: 'safe-lessons',
        title: '安全上课',
        body: (
          <>
            <p>我们的许多学生未满 18 岁，许多导师本身也是学生。为了大家的安全：</p>
            <ul>
              <li>课程在线上进行，使用课程页面上的视频通话链接。不要线下见面。</li>
              <li>通过 Note by Note 的消息功能联系。不要索要或分享私人电话号码、社交媒体账号或住址。</li>
              <li>谈话内容围绕音乐和课程。</li>
              <li>在合适的地方参加视频通话，穿着上学时会穿的衣服。</li>
              <li>未满 13 岁的学生上课时，必须有家长或监护人在附近。未满 18 岁的学生在开始上课前，需要家长或监护人的<Link href={to('/parent-consent')}>同意</Link>。</li>
              <li>除非双方都同意，否则不要录制课程，也不要给对方拍照或截图。如果学生未满 18 岁，还需要其家长或监护人同意。</li>
              <li>不送礼物，不收钱。课程是免费的，导师从不要求付费。</li>
            </ul>
          </>
        ),
      },
      {
        id: 'mentors',
        title: '导师须知',
        body: (
          <ul>
            <li>你是学生的榜样。保持耐心，多鼓励学生，并如实说明你能教什么。</li>
            <li>与学生及其家人保持友好但专业的关系。</li>
            <li>对你所了解的学生信息保密。不要在 Note by Note 以外分享学生的资料。</li>
            <li>如果学生说的话让你担心其安全，请立即通过<Link href="/contact">联系页面</Link>告知团队。不要试图自己处理。</li>
          </ul>
        ),
      },
      {
        id: 'volunteers',
        title: '团队志愿者须知',
        body: (
          <ul>
            <li>你在工作人员区（Staff area）看到的内容，只能用于你的职责，并且只在需要时使用。</li>
            <li>不要在 Note by Note 以外复制、下载或分享任何人的个人信息。</li>
            <li>管理员只为保护大家才会阅读导师和学生之间的消息，例如有消息被举报时。</li>
            <li>不要对你自己的申请或课程做决定，请交给团队里的其他人处理。</li>
          </ul>
        ),
      },
      {
        id: 'sharing',
        title: '分享文件和音乐',
        body: (
          <>
            <p>只分享你有权分享的内容。尊重版权：不要传播付费乐谱，或你无权分享的录音。</p>
            <p>学生的录音、作品和其他创作归学生本人所有。未经学生许可，不要分享给任何人；如果学生未满 18 岁，还需要其家长或监护人许可。</p>
          </>
        ),
      },
      {
        id: 'messages',
        title: '消息和安全检查',
        body: (
          <p>导师和学生之间的消息保留在 Note by Note 上，以便我们保护每个人。Note by Note 的管理员可以阅读这些消息，例如有消息被举报时。其他志愿者不能阅读。详情请见我们的<Link href={to('/privacy')}>隐私政策</Link>。</p>
        ),
      },
      {
        id: 'report',
        title: '举报问题',
        body: (
          <>
            <p>如果有什么让你觉得不对劲，请告诉我们。你可以在消息、课程或导师页面上点击<strong>Report</strong>（举报），也可以在控制面板中<Link href="/dashboard/report">举报问题</Link>，或者通过<Link href="/contact">联系页面</Link>给我们留言。被举报的人不会知道是谁举报的。</p>
            <p>如果有人身处危险，请先拨打当地的紧急电话。</p>
          </>
        ),
      },
      {
        id: 'breaking',
        title: '违反本准则的后果',
        body: (
          <>
            <p>视情况而定，我们可能会发出警告、暂停课程、解除导师与学生的配对、让某人退出项目，或关闭其账户。</p>
            <p>如果我们担心某个未成年人的安全，可能会告知其家长或监护人，并在法律要求时通知有关部门。</p>
          </>
        ),
      },
    ],
  },

  terms: {
    title: '使用条款',
    description: '使用 Note by Note 网站和参加其免费音乐课程的条款。',
    summary: <p>简单来说：课程免费，导师是志愿者，我们保护每个人的安全，也尊重别人分享的内容。详情如下。</p>,
    sections: [
      {
        id: 'about',
        title: '关于本条款',
        body: (
          <>
            <p>本条款适用于所有使用 Note by Note 网站的人。创建账户或使用本网站，即表示你同意本条款、我们的<Link href={to('/code-of-conduct')}>行为准则</Link>，以及我们在<Link href={to('/privacy')}>隐私政策</Link>中所述的信息处理方式。</p>
            <p>如果你未满 18 岁，请和你的家长或监护人一起阅读本条款。</p>
          </>
        ),
      },
      {
        id: 'what-we-are',
        title: '什么是 Note by Note',
        body: (
          <>
            <p>Note by Note 是一个由学生发起的志愿者项目，提供免费的在线音乐课程。导师是志愿者，很多本身也是学生。他们乐器演奏得好，讲解也有耐心，但不是专业教师。</p>
            <p>课程是免费的。我们会尽力为每位学生配对导师，但无法保证一定能配对成功、配到某位特定导师、上固定次数的课，或取得任何特定成果。</p>
          </>
        ),
      },
      {
        id: 'accounts',
        title: '你的账户',
        body: (
          <ul>
            <li>请提供正确的信息，并及时更新。</li>
            <li>不要分享你的密码。你需要对自己账户中发生的事情负责。</li>
            <li>一人一个账户。家长或监护人可以为孩子创建和管理账户。</li>
            <li>如果你认为有人使用了你的账户，请通过<Link href="/contact">联系页面</Link>告诉我们。</li>
          </ul>
        ),
      },
      {
        id: 'under-18',
        title: '未满 18 岁的学生',
        body: (
          <p>未满 18 岁的学生开始上课前，必须由家长或监护人给予<Link href={to('/parent-consent')}>同意</Link>。家长或监护人可以随时联系我们撤回同意，课程随即停止。</p>
        ),
      },
      {
        id: 'lessons',
        title: '课程',
        body: (
          <>
            <p>学生和导师在网站上安排课程。课程通过视频通话服务进行，例如 Zoom 或 Google Meet，使用课程页面上的链接。通话适用该服务自己的条款和隐私政策。</p>
            <p>任何一方都可以随时停止上课。请告知对方和团队。</p>
          </>
        ),
      },
      {
        id: 'content',
        title: '你分享的内容',
        body: (
          <>
            <p>你发布或上传的内容仍然属于你：消息、文件、录音和你的导师页面。你允许 Note by Note 保存这些内容，并向其对应的人展示，以便网站正常运作。</p>
            <p>导师页面（包括已批准的照片）在我们的团队发布后，会公开显示在 Find a Mentor（寻找导师）页面上。About（关于我们）页面上列出的团队成员也会显示在那里。</p>
            <p>不要分享任何违法或有害的内容，也不要分享你无权分享的内容。对于违反本条款或行为准则的内容，我们可以将其删除。</p>
          </>
        ),
      },
      {
        id: 'use',
        title: '合理使用网站',
        body: (
          <ul>
            <li>不要试图进入别人的账户，或网站上你无权访问的部分。</li>
            <li>不要干扰网站、使其超负荷，或大量抓取网站上的信息。</li>
            <li>不要用本网站发送垃圾信息或广告。</li>
          </ul>
        ),
      },
      {
        id: 'volunteers',
        title: '志愿者',
        body: (
          <>
            <p>团队志愿者可以访问其职责所需的内容。这些权限只能用于 Note by Note 的工作，你在其中看到的内容需要保密。</p>
            <p>志愿服务时长记录在网站上，由团队审批。我们无法保证学校或其他机构会认可这些时长。</p>
          </>
        ),
      },
      {
        id: 'ending',
        title: '关闭账户',
        body: (
          <p>你可以随时通过<Link href="/contact">联系页面</Link>要求我们关闭你的账户。如果某个账户违反本条款或行为准则，或者为了保护他人，我们可以暂停或关闭该账户。</p>
        ),
      },
      {
        id: 'no-guarantees',
        title: '不作保证',
        body: (
          <>
            <p>本网站由志愿者运营，按现状提供。网站有时可能较慢或无法使用，例如服务器在一段时间无人使用后重新启动时。</p>
            <p>在法律允许的范围内，Note by Note 及其志愿者不对因使用本网站或课程而造成的间接损失负责。本条款中的任何内容都不会取消法律赋予你的权利。</p>
          </>
        ),
      },
      {
        id: 'changes',
        title: '本条款的变更',
        body: (
          <p>我们可能会更新本条款。上方的日期显示最近一次修改的时间。如果某项变更影响你使用网站的方式，我们会在你下次登录时请你同意新版本。</p>
        ),
      },
      {
        id: 'contact',
        title: '联系我们',
        body: (
          <p>对本条款有疑问？请通过<Link href="/contact">联系页面</Link>给我们留言。</p>
        ),
      },
    ],
  },

  privacy: {
    title: '隐私政策',
    description: 'Note by Note 保存哪些信息、为什么保存，以及谁可以看到。',
    summary: <p>我们只保存提供免费课程和保护学生所需的信息。我们不会出售这些信息，也不会用于广告。</p>,
    sections: [
      {
        id: 'collect',
        title: '我们保存什么',
        body: (
          <>
            <p>我们只保存提供免费课程和保护大家所需的信息：</p>
            <ul>
              <li><strong>你的账户：</strong>你的姓名、电子邮件地址和你在网站上的角色。你的密码以加密形式保存，Note by Note 的任何人都无法读取。</li>
              <li><strong>申请：</strong>你的回答，例如你的学校、年龄段、乐器、水平、有空的日子和时间、语言和目标。对于未满 18 岁的学生，还包括家长或监护人的姓名和电子邮件。</li>
              <li><strong>导师页面：</strong>导师写的自我介绍、所教乐器、每周有空的时间，以及照片（如果有添加）。</li>
              <li><strong>课程：</strong>课程申请、约定的上课时间、“无法参加”通知、课程笔记、练习清单和视频通话链接。</li>
              <li><strong>消息和文件：</strong>导师和学生之间分享的内容。</li>
              <li><strong>志愿服务时长：</strong>导师和志愿者记录的时长。</li>
              <li><strong>同意记录：</strong>你接受行为准则和使用条款的时间，以及你输入的姓名。对于未满 18 岁的学生，还包括其家长或监护人的同意：姓名、电子邮件、与学生的关系和日期。</li>
              <li><strong>通过我们的联系表单发送的消息。</strong></li>
              <li><strong>访问记录：</strong>哪些页面被浏览，不包括网址中可能识别出你身份的部分。</li>
            </ul>
          </>
        ),
      },
      {
        id: 'use',
        title: '我们如何使用',
        body: (
          <>
            <p>用于为学生配对导师、安排和进行课程、保护每个人、就项目事宜联系你，以及了解哪些页面有用。</p>
            <p>我们不会出售你的信息，也不会用于广告。</p>
          </>
        ),
      },
      {
        id: 'who-sees',
        title: '谁可以看到',
        body: (
          <ul>
            <li><strong>你的导师或学生。</strong>导师在接受学生之前，可以看到学生的名字、年龄段、水平、乐器和偏好的时间。接受之后，还可以看到提交申请的账户的姓名和电子邮件。</li>
            <li><strong>公众。</strong>已发布的导师页面（包括已批准的照片）会显示在 Find a Mentor 页面上。About 页面上的团队成员会显示在那里。其他内容都不公开。</li>
            <li><strong>Note by Note 团队。</strong>志愿者只能看到其职责所需的内容。管理员可以阅读导师和学生之间的消息，以保护大家，例如有消息被举报时。有些志愿者只能看到总数，看不到姓名。</li>
            <li><strong>让网站运作的服务</strong>（见下方列表），仅用于完成相应的工作。</li>
            <li><strong>其他人，仅在必要时：</strong>法律要求时，或为了保护某人免受伤害时。</li>
          </ul>
        ),
      },
      {
        id: 'services',
        title: '我们使用的服务',
        body: (
          <ul>
            <li><strong>Vercel</strong> 托管网站并统计页面访问量。</li>
            <li><strong>Render</strong> 运行我们的服务器。</li>
            <li><strong>MongoDB Atlas</strong> 存储我们的数据库。</li>
            <li><strong>Google Analytics</strong> 统计访问量。我们关闭了 Google Signals 和广告个性化功能，并从它看到的网址中去掉了任何可能识别你身份的内容。</li>
            <li><strong>Formspree</strong> 传送我们联系表单中的消息。</li>
            <li><strong>一个邮件发送服务</strong>负责发送网站的电子邮件，例如课程通知和同意请求。</li>
            <li><strong>你为课程选择的视频通话服务</strong>，例如 Zoom 或 Google Meet，有各自的隐私政策。</li>
          </ul>
        ),
      },
      {
        id: 'cookies',
        title: 'Cookie 和浏览器存储',
        body: (
          <>
            <p>为了让你保持登录状态，网站会在你的浏览器存储中保存一个登录密钥。网站还会记住一些小偏好，例如你上次使用的控制面板标签页。退出登录时，该密钥会被删除。</p>
            <p>Google Analytics 使用 Cookie 来统计访问量。Vercel 的访问统计不使用 Cookie。你可以在浏览器设置中阻止或删除 Cookie，网站仍可正常使用。</p>
          </>
        ),
      },
      {
        id: 'security',
        title: '安全',
        body: (
          <p>与网站的连接是加密的。密码以加密形式保存。上传的照片会去除位置和相机信息。志愿者的访问权限仅限于其职责，工作人员只能进入测试账户，绝不能进入真实用户的账户。</p>
        ),
      },
      {
        id: 'how-long',
        title: '我们保存多久',
        body: (
          <p>只要你的账户还在，我们就会保存你的信息。当你要求关闭账户时，我们会删除你的信息或将其匿名化，但出于安全原因或法律要求必须保留的信息除外。</p>
        ),
      },
      {
        id: 'choices',
        title: '你的选择',
        body: (
          <ul>
            <li>通过<Link href="/contact">联系页面</Link>要求查看、更正或删除你的信息。</li>
            <li>在<Link href="/dashboard/settings">账户设置</Link>中选择你要接收哪些电子邮件。</li>
            <li>家长或监护人可以随时联系我们，撤回对孩子的同意。</li>
          </ul>
        ),
      },
      {
        id: 'children',
        title: '儿童和青少年',
        body: (
          <p>我们的许多学生未满 18 岁。家长或监护人在课程开始前给予<Link href={to('/parent-consent')}>同意</Link>，并可以要求查看或删除孩子的信息。如果你未满 13 岁，请让你的家长或监护人和你一起创建账户。</p>
        ),
      },
      {
        id: 'changes',
        title: '本政策的变更',
        body: <p>如果我们改变处理信息的方式，会更新本页面和上方的日期。</p>,
      },
      {
        id: 'contact',
        title: '联系我们',
        body: (
          <p>对隐私有疑问？请通过<Link href="/contact">联系页面</Link>给我们留言。</p>
        ),
      },
    ],
  },

  consent: {
    title: '家长和监护人同意书',
    description: '未满 18 岁的学生在 Note by Note 上课时，家长和监护人需要同意的内容。',
    summary: <p>未满 18 岁的学生开始上课前，需要家长或监护人的同意。本页介绍课程的内容，以及您同意的事项。</p>,
    sections: [
      {
        id: 'lessons',
        title: '课程内容',
        body: (
          <ul>
            <li>与志愿者导师进行的免费一对一音乐课，导师通常是高中生或大学生。</li>
            <li>课程通过视频通话进行，例如 Zoom 或 Google Meet，每周的上课时间由您的孩子和导师商定。</li>
            <li>您的孩子和导师可以在 Note by Note 网站上互发消息、分享文件和记录课程笔记。</li>
            <li>完全免费，导师从不索要金钱或礼物。</li>
          </ul>
        ),
      },
      {
        id: 'safety',
        title: '我们如何保护学生',
        body: (
          <ul>
            <li>每个人都要接受我们的<Link href={to('/code-of-conduct')}>行为准则</Link>：课程在线上进行，联系只通过网站进行，谈话内容围绕音乐。</li>
            <li>导师不会索要电话号码、社交媒体账号或住址，也不会与学生线下见面。</li>
            <li>Note by Note 的管理员可以阅读导师和学生之间的消息，例如有消息被举报时。</li>
            <li>除非双方都同意，并且您也同意，否则课程不会被录制。</li>
            <li>学生和家长可以随时举报问题，被举报的人不会知道是谁举报的。</li>
          </ul>
        ),
      },
      {
        id: 'information',
        title: '您孩子的导师能看到什么',
        body: (
          <p>在接受之前，导师可以看到您孩子的名字、年龄段、水平、乐器和偏好的时间。接受之后，还可以看到提交申请的账户的姓名和电子邮件。其余内容请见我们的<Link href={to('/privacy')}>隐私政策</Link>。</p>
        ),
      },
      {
        id: 'agreeing',
        title: '您同意的事项',
        body: (
          <ul>
            <li>您是该学生的家长或法定监护人，或是负责照顾该学生的人。</li>
            <li>您的孩子可以参加免费在线课程，并按上述方式使用本网站。</li>
            <li>您已阅读行为准则和隐私政策。</li>
            <li>如果您的孩子未满 13 岁，上课时您或另一位成年人会在附近。</li>
          </ul>
        ),
      },
      {
        id: 'withdraw',
        title: '如果您改变主意',
        body: (
          <p>您可以随时通过我们的<Link href="/contact">联系页面</Link>撤回同意。课程将会停止，您也可以要求我们删除您孩子的信息。</p>
        ),
      },
    ],
  },
};
