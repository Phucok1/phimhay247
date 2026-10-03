import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseYouTubeUrl } from './youtubeParser.js';

export interface Movie {
  id: string;
  title: string;
  slug: string;
  description: string;
  posterUrl: string;
  bannerUrl: string;
  category: string[];
  year: number;
  status: 'Đang cập nhật' | 'Hoàn thành' | 'Tạm dừng';
  keywords: string;
  seoTitle: string;
  seoDescription: string;
  episodeCount: number;
  latestEpisode: number;
  viewCount: number;
  hidden?: boolean;
  featured?: boolean;
  contributorName?: string; // Tên hội viên chia sẻ (nếu có)
  createdAt: string;
  updatedAt: string;
}

export interface EpisodeServer {
  id: string;
  name: string; // Tên hiển thị: "Server 1 (YouTube)", "Server 2 (Facebook)", v.v.
  url: string;
  videoId: string;
  embedUrl: string;
  platform?: string;
}

export interface Episode {
  id: string;
  movieId: string;
  episodeNumber: number;
  title: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  youtubeEmbedUrl: string;
  thumbnailUrl: string;
  viewCount: number;
  servers?: EpisodeServer[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderBadge?: string; // 'Hội viên VIP' | 'Quản trị viên' | 'Thành viên'
  avatarColor?: string;
  content: string;
  createdAt: string;
}

export interface FeedbackItem {
  id: string;
  name: string;
  contact?: string; // SĐT, Email hoặc Zalo
  type: 'Báo lỗi tập phim' | 'Yêu cầu phim mới' | 'Góp ý tính năng' | 'Khác';
  movieTitle?: string;
  episodeNumber?: number;
  content: string;
  status: 'Chờ xử lý' | 'Đã xử lý';
  createdAt: string;
}

export interface MemberEpisodeItem {
  episodeNumber: number;
  title: string;
  videoUrl: string;
}

export interface MemberMovieSubmission {
  id: string;
  title: string;
  slug: string;
  contributorName: string; // Tên hội viên
  contributorContact?: string;
  description: string;
  category: string[];
  videoUrl: string;
  episodes?: MemberEpisodeItem[];
  parsedVideoId?: string;
  parsedEmbedUrl?: string;
  parsedPlatform?: string;
  posterUrl?: string;
  status: 'Chờ duyệt' | 'Đã duyệt' | 'Từ chối';
  rejectionReason?: string;
  approvedMovieId?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  siteName: string;
  channelUrl: string;
  channelName: string;
  youtubeApiKey?: string;
  adminKey?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  donateBankName?: string;
  donateAccountNumber?: string;
  donateAccountName?: string;
  donateMomo?: string;
  donateQrUrl?: string;
  donateNote?: string;
  adSenseSafeMode?: boolean; // Bật để ẩn link phim lậu khi gửi Google AdSense xét duyệt
}

export interface Chapter {
  chapterNumber: number;
  title: string;
  content: string;
  createdAt?: string;
}

export interface Novel {
  id: string;
  title: string;
  slug: string;
  author: string;
  category: string[];
  coverUrl: string;
  description: string;
  status: 'Đang ra' | 'Hoàn thành';
  viewCount: number;
  linkedMovieSlug?: string;
  sourceUrl?: string;
  chapters: Chapter[];
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  movies: Movie[];
  episodes: Episode[];
  categories: Category[];
  settings: SiteSettings;
  chatMessages: ChatMessage[];
  feedbacks: FeedbackItem[];
  memberSubmissions: MemberMovieSubmission[];
  novels: Novel[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Hàm tạo slug tiếng Việt chuẩn SEO
export function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-member', name: 'Phim Hội Viên', slug: 'phim-hoi-vien' },
  { id: 'cat-1', name: 'Kiếm Hiệp', slug: 'kiem-hiep' },
  { id: 'cat-2', name: 'Tiên Hiệp', slug: 'tien-hiep' },
  { id: 'cat-3', name: 'Cổ Trang', slug: 'co-trang' },
  { id: 'cat-4', name: 'Hành Động', slug: 'hanh-dong' },
  { id: 'cat-5', name: 'Huyền Huyễn', slug: 'huyen-huyen' },
  { id: 'cat-6', name: 'Ngôn Tình', slug: 'ngon-tinh' },
  { id: 'cat-7', name: 'Xuyên Không', slug: 'xuyen-khong' },
  { id: 'cat-8', name: 'Hoạt Hình 3D', slug: 'hoat-hinh-3d' },
];

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'PHIM HAY 247',
  channelUrl: 'https://www.youtube.com/@phimhay.momtiti',
  channelName: '@phimhay.momtiti',
  seoTitle: 'PHIM HAY 247 - Xem Phim Hay Tuyển Chọn Mới Nhất',
  seoDescription: 'PHIM HAY 247 - Website xem phim tuyển chọn, tổng hợp các bộ phim kiếm hiệp, cổ trang, ngôn tình phát trực tiếp từ YouTube.',
  seoKeywords: 'phim hay, phim moi, phim youtube, xem phim 247, phim kiem hiep, phim co trang',
  adminKey: 'admin123',
  donateBankName: 'Vietcombank',
  donateAccountNumber: '',
  donateAccountName: 'NGUYỄN THIỆN PHÚC',
  donateMomo: '',
  donateQrUrl: '/images/donate-qr.png',
  donateNote: 'Ủng hộ duy trì server và phát triển kênh Phim Hay 247',
  adSenseSafeMode: false,
};

const DEFAULT_NOVELS: Novel[] = [
  {
    id: 'novel-luu-ly-kiem-tong',
    title: 'Lưu Ly Kiếm Tông',
    slug: 'luu-ly-kiem-tong',
    author: 'Cổ Chân',
    category: ['Tiên Hiệp', 'Kiếm Hiệp', 'Trọng Sinh', 'Huyền Huyễn'],
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    description: 'Thiếu niên Lâm Phong vốn là đệ tử ngoại môn của Lưu Ly Kiếm Tông, chịu đủ mọi khi nhục, bị người bày mưu hãm hại dẫn đến đan điền vỡ nát, kinh mạch tắc nghẽn. Trong tuyệt cảnh bờ vực cái chết, hắn vô tình đánh thức kiếm hồn viễn cổ ngủ say ngàn năm – Lưu Ly Kiếm Tâm. Một thanh kiếm chấn nhiếp bát hoang, nghịch thiên cải mệnh, từng bước chém tan mọi bất công nơi hồng trần, bước lên đỉnh phong Tiên Đạo!',
    status: 'Đang ra',
    viewCount: 1250,
    linkedMovieSlug: 'luu-ly-kiem-tong',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    chapters: [
      {
        chapterNumber: 1,
        title: 'Chương 1: Đan Điền Vỡ Nát, Kiếm Tâm Thức Tỉnh',
        content: `Mưa đêm tí tách rơi trên những phiến ngói lưu ly lạnh lẽo của Kiếm Phong.

Tại một góc hoang phế sau núi Lưu Ly Kiếm Tông, một thiếu niên áo lam rách rưới đang nằm gục giữa vũng máu loãng. Khí tức của hắn yếu ớt như ngọn đèn cạn dầu trước gió lốc, khóe miệng không ngừng trào ra máu tươi đỏ thẫm.

Hắn tên là Lâm Phong, đệ tử ngoại môn của đệ nhất kiếm môn nơi Nam Vực. Chỉ vì một đóa Lưu Ly Tuyết Liên ngàn năm hái được dưới đáy vực sâu, hắn bị chính đường huynh Lâm Vũ liên kết với trưởng lão ngoại môn bức hại, đánh nát đan điền, phế bỏ toàn bộ tu vi ba năm khổ cực rèn luyện.

"Lâm Phong... ngươi chỉ là một kẻ xuất thân từ nhánh thứ, có tư cách gì đòi giữ lấy bảo vật thiên địa này?"

Thanh âm trào phúng, lạnh lùng của Lâm Vũ vẫn còn văng vẳng bên tai như lưỡi dao cắm sâu vào tâm can. Lâm Phong siết chặt hai bàn tay, móng tay găm sâu vào lòng bàn tay chảy máu, nhưng cơn đau thể xác sao bằng nỗi hận thấu tận tâm can.

"Ta không cam tâm... Nếu ông trời cho ta thêm một cơ hội, ta nhất định sẽ khiến kẻ phụ ta phải nợ máu trả bằng máu!"

Ngay khi ý thức của Lâm Phong sắp sửa chìm vào bóng tối vĩnh hằng, bỗng nhiên giữa mi tâm của hắn lóe lên một đạo tử quang kỳ dị.

"Ong! Ong! Ong!"

Một chuỗi tiếng kiếm minh thanh thúy như tiếng chuông đồng vọng lại từ thời kỳ hồng hoang viễn cổ vang lên rền rĩ trong thức hải. Một thanh tiểu kiếm trong suốt như pha lê, lưu chuyển quang hoa thất sắc hiện ra, chậm rãi xoay tròn giữa đan điền đã vỡ vụn của hắn.

"Hậu bối kiên nghị, ngàn năm trôi qua, cuối cùng cũng có kẻ kích hoạt được bổn tọa..."

Thanh âm uy nghiêm cổ kính vang lên, một cỗ năng lượng sinh mệnh bàng bạc ấm áp tức thì tuôn trào, chữa lành từng thớ cơ bắp, từng tấc kinh mạch. Đan điền vốn vỡ nát bỗng chốc được tái tạo, vững chắc như kim cương bất hoại!

Lâm Phong chậm rãi mở mắt, trong con ngươi lóe lên một tia kiếm ý khiếp người.

Lưu Ly Kiếm Tâm thượng cổ truyền thừa... Hắn, Lâm Phong, đã chính thức trọng sinh!`,
      },
      {
        chapterNumber: 2,
        title: 'Chương 2: Nhất Kiếm Đoạt Mệnh, Chấn Kinh Ngoại Môn',
        content: `Sáng sớm hôm sau, ráng mây màu tím bao phủ khắp rặng Lưu Ly Sơn.

Tại Ngoại Môn Diễn Võ Trường, hàng trăm đệ tử đang tề tựu đông đủ để tham dự kỳ sát hạch phân chia đệ tử quý mới. 

Lâm Vũ đứng ở vị trí đắc địa nhất, trên người khoác gấm vóc hoa lệ, bên hông đeo một thanh kiếm nạm ngọc tinh xảo. Hắn cười nhạt nhìn quanh, đắc ý nói với mấy tên đệ tử nịnh hót xung quanh:
"Hôm nay sau kỳ sát hạch, đệ nhất ngoại môn tất thuộc về ta. Còn tên phế vật Lâm Phong kia, giờ này chắc đã làm mồi cho sài lang dưới chân núi rồi."

"Lâm Vũ sư huynh thiên phú trác tuyệt, tên phế vật kia làm sao sánh nổi với huynh!" Đám người xun xoe hưởng ứng.

Thế nhưng, ngay khi tiếng cười còn chưa dứt, một bóng người gầy guộc nhưng thẳng tắp như ngọn thương chậm rãi bước lên bậc đá dẫn vào quảng trường.

Áo lam bay phần phật trong gió sớm, ánh mắt sáng rực như tinh tú trên trời đêm.

"Là... là Lâm Phong?! Làm sao có thể?! Hắn chẳng phải đã bị phế đan điền rồi sao?!"

Cả quảng trường trong chốc lát rơi vào im lặng như tờ. Lâm Vũ trợn trừng hai mắt, nụ cười trên môi lập tức cứng đờ, trong lòng dấy lên một nỗi bất an tột cùng.

Lâm Phong không liếc nhìn bất kỳ ai, từng bước vững chãi tiến thẳng lên lôi đài số một, mũi kiếm rỉ sét trong tay chỉ thẳng vào mặt Lâm Vũ:

"Lâm Vũ, nợ ngày hôm qua, hôm nay ta và ngươi liền tính cho rõ ràng!"

"Hừ, tên phế vật giả thần giả quỷ! Hôm qua chưa đánh chết ngươi là do bổn thiếu gia lòng dạ từ bi, hôm nay ngươi tự tìm tới cửa nộp mạng, đừng trách ta độc thủ!" 

Lâm Vũ gầm lên giận dữ, rút trường kiếm nạm ngọc ra khỏi vỏ, kiếm khí Luyện Khí tầng năm bùng nổ, hóa thành ba đạo kiếm quang hung hiểm đâm thẳng tới ngực Lâm Phong.

Đối mặt với chiêu kiếm hung hãn ấy, Lâm Phong chỉ đứng yên bất động. Cho đến khi mũi kiếm chỉ còn cách ngực áo nửa tấc, hắn mới khẽ nhấc tay.

"Vút!"

Chỉ một kiếm đơn giản, không hoa mỹ, không chiêu thức rườm rà.

Thế nhưng trên thân kiếm rỉ sét lại bùng phát ra một đạo kiếm khí lưu ly sáng chói lòa, sắc bén đến mức xé rách cả không gian!

"Keng! Rắc!"

Thanh bảo kiếm nạm ngọc của Lâm Vũ vỡ tan thành từng mảnh vụn. Một cỗ lực lượng như núi đè trực tiếp giáng xuống ngực hắn, hất văng Lâm Vũ bay xa mười trượng, ngã gục xuống sàn lôi đài thổ huyết liên hồi.

Nhất kiếm phá địch!

Toàn trường chấn động đến ngạt thở!`,
      },
      {
        chapterNumber: 3,
        title: 'Chương 3: Khí Phách Thiếu Niên, Hướng Tới Kiếm Tông Chi Đỉnh',
        content: `Cả diễn võ trường tĩnh lặng đến mức một cây kim rơi cũng có thể nghe thấy.

Các vị trưởng lão ngoại môn ngồi trên khán đài cao đều bật dậy, ánh mắt tràn đầy vẻ kinh hãi không thể tin nổi. 

Lâm Vũ vốn là hạt giống số một ngoại môn, đã đạt tới Luyện Khí tầng năm đỉnh phong, lại bị một thiếu niên từng bị xem là phế vật đánh bại chỉ bằng một chiêu kiếm duy nhất! Hơn nữa, cỗ kiếm ý tinh thuần kia... căn bản không phải là thứ mà cảnh giới Luyện Khí có thể thi triển ra được!

"Ngươi... ngươi làm sao có thể..." Lâm Vũ nằm rạp dưới đất, ngực đau đớn như bị vỡ nát, run rẩy chỉ tay vào Lâm Phong, trong mắt tràn đầy nỗi sợ hãi tột cùng.

Lâm Phong chậm rãi thu kiếm về vỏ, ánh mắt lãnh đạm nhìn xuống kẻ thù:
"Lâm Vũ, ngươi cậy quyền cậy thế, mưu hại đồng môn. Hôm nay ta phế đi một nửa tu vi của ngươi, xem như trả lại món nợ ngày hôm qua. Nếu còn dám tái phạm, ta lấy đầu ngươi!"

Lời nói lạnh lẽo thấu xương khiến Lâm Vũ rùng mình ớn lạnh, không dám thốt thêm nửa lời, ngất lịm đi trong nhục nhã.

Lúc này, một vị lão giả râu tóc bạc phơ từ trên đài cao phi thân đáp xuống. Đó chính là Mạc trưởng lão, người chấp chưởng Tàng Kiếm Các của nội môn, địa vị tôn sùng.

Lão nhìn chằm chằm vào Lâm Phong, vuốt râu mỉm cười tán thưởng:
"Kiếm ý thuần khiết, tâm tính kiên định vững như bàn thạch! Thiếu niên, ngươi có nguyện ý bái nhập môn hạ của lão phu, trở thành đệ tử chân truyền của Tàng Kiếm Các không?"

Lời này vừa thốt ra, vô số ánh mắt ghen tị và ngưỡng mộ lập tức đổ dồn về phía Lâm Phong. Trở thành đệ tử chân truyền của Tàng Kiếm Các, địa vị trong môn phái sẽ một bước lên mây!

Lâm Phong khom người ôm quyền, cất giọng sang sảng:
"Đa tạ Mạc trưởng lão ưu ái! Đệ tử nguyện ý!"

Ánh mắt hắn nhìn về phía đỉnh Lưu Ly Sơn sừng sững giữa biển mây. Hắn biết, con đường tu tiên chân chính của mình mới chỉ vừa bắt đầu. Một ngày nào đó, thanh kiếm trong tay hắn sẽ phá tan hư không, ngạo thị cửu thiên!`,
      },
    ],
  },
  {
    id: 'novel-pham-nhan-tu-tien',
    title: 'Phàm Nhân Tu Tiên',
    slug: 'pham-nhan-tu-tien',
    author: 'Vong Ngữ',
    category: ['Tiên Hiệp', 'Tu Chân', 'Cổ Điển'],
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    description: 'Hàn Lập - một thiếu niên bình thường xuất thân bần hàn nơi sơn thôn hẻo lánh, tình cờ bước vào một giang hồ môn phái nhỏ. Tư chất bình thường, lại mang theo một chiếc bình nhỏ thần bí thần kỳ, hắn dựa vào tâm tính kiên định, từng bước từng bước đạp lên con đường tu tiên gian nan muôn trùng.',
    status: 'Hoàn thành',
    viewCount: 3820,
    linkedMovieSlug: 'pham-nhan-tu-tien',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    chapters: [
      {
        chapterNumber: 1,
        title: 'Chương 1: Sơn Thôn Thiếu Niên',
        content: `Mặt trời dần ngả về phía tây, ráng chiều màu đỏ thẫm nhuộm kín cả một vùng chân trời của Thanh Ngưu Trấn.

Dưới chân dãy núi xa xôi, một ngôi làng nhỏ tên gọi Hàn Gia Thôn hiện ra yên bình giữa làn khói lam chiều bảng lảng. Ở một căn nhà tranh đơn sơ góc làng, một thiếu niên da dẻ ngăm đen, tầm mười tuổi, đang ngồi xếp bằng trên tảng đá xanh trước sân nhà.

Hắn tên là Hàn Lập, trong nhà đứng hàng thứ tư nên người trong thôn hay gọi là Hàn Lão Thất. 

Gia cảnh nhà họ Hàn hết sức bần hàn, quanh năm chỉ trông chờ vào mấy mẫu ruộng cằn cỗi trên sườn đồi. Phụ mẫu của hắn quanh năm còng lưng làm lụng vất vả nhưng vẫn không đủ nuôi nổi sáu miệng ăn. Hôm nay, tam thúc của hắn - người duy nhất trong họ làm việc trên tửu lâu lớn ngoài trấn - vừa gửi tin tức về. 

Thất Huyền Môn, một môn phái giang hồ nổi tiếng trong vùng, sắp mở đợt tuyển chọn đệ tử mới. Tam thúc muốn tiến cử Hàn Lập đến thử vận may. Nếu may mắn được chọn làm đệ tử ngoại môn, mỗi tháng không những được ăn no mặc ấm mà còn có bạc gửi về phụ giúp gia đình.

Hàn Lập nhìn bàn tay thô ráp của phụ thân và mái tóc bạc sớm của mẫu thân, trong lòng thầm hạ quyết tâm: "Bất kể ra sao, ta nhất định phải tiến vào Thất Huyền Môn!"`,
      },
      {
        chapterNumber: 2,
        title: 'Chương 2: Thất Huyền Tuyển Đệ Tử',
        content: `Đỉnh Thái Nhạc Sơn quanh năm sương mù bao phủ, đây chính là nơi đặt tổng đà của Thất Huyền Môn.

Hơn trăm thiếu niên từ khắp các quận huyện tụ họp về đây, ai nấy đều mang vẻ mặt hồi hộp, lo âu xen lẫn kỳ vọng. 

Một vị chấp sự trung niên mặc cẩm bào mang vẻ mặt nghiêm nghị bước ra, ánh mắt sắc như chim ưng đảo qua đám thiếu niên:
"Hôm nay là kỳ sát hạch nhập môn, quy tắc rất đơn giản. Trước khi mặt trời lặn, kẻ nào leo lên được đỉnh Luyện Cốt Nhai mới có tư cách trở thành đệ tử chính thức của Thất Huyền Môn!"

Luyện Cốt Nhai cao vút ngàn trượng, dốc đá dựng đứng trơn trượt như bôi mỡ. Đối với những đứa trẻ mười tuổi, đây là một thử thách gian nan đến tột cùng.

Từng đợt thiếu niên bắt đầu gồng mình trèo lên. Những đứa trẻ nhà giàu có căn cơ võ học từ nhỏ nhanh chóng vượt lên dẫn đầu. Hàn Lập không có căn cơ gì, chỉ có sức khỏe và sự dẻo dai của một đứa trẻ nhà nông. Hắn cắn chặt răng, tay bám vào khe đá, chân đạp lên gờ đá gồ ghề, từng tấc từng tấc leo lên.

Bàn tay rớm máu, đầu gối bầm tím, mồ hôi ướt đẫm manh áo tơi rách. Khi nhiều đứa trẻ khác đã kiệt sức bỏ cuộc ngồi khóc bên vách núi, ánh mắt Hàn Lập vẫn kiên định nhìn thẳng lên đỉnh nhai.`,
      },
      {
        chapterNumber: 3,
        title: 'Chương 3: Bí Mật Mặc Đại Phu',
        content: `Cuối cùng, Hàn Lập tuy không lọt vào top dẫn đầu nhưng nhờ vào ý chí kiên cường không chịu bỏ cuộc, hắn đã lọt vào mắt xanh của một vị nhân vật đặc biệt trong môn phái – Mặc Đại Phu của Thần Thủ Cốc.

Thần Thủ Cốc là một thung lũng yên tĩnh tách biệt với sự ồn ào của môn phái, khắp nơi trồng đầy các loại dược thảo quý hiếm.

Mặc Đại Phu là một lão giả gầy gò, sắc mặt xanh xao nhưng đôi mắt lại sáng rực thâm thúy. Lão kiểm tra kinh mạch của Hàn Lập hồi lâu, sau đó khẽ gật đầu, đưa cho hắn một quyển sách da ố vàng:
"Quyển công pháp này tên là Trường Xuân Công. Trong vòng một năm, nếu ngươi có thể tu luyện ra tầng thứ nhất, lão phu sẽ chính thức nhận ngươi làm đệ tử chân truyền y thuật."

Hàn Lập ôm quyển sách vào lòng, cung kính khấu đầu bái tạ. 

Đêm đó, trong căn phòng trúc nhỏ giữa thung lũng thanh vắng, thiếu niên ngồi xếp bằng bên ngọn đèn dầu, bắt đầu lật từng trang của bí kíp Trường Xuân Công. Hắn hoàn toàn không ngờ rằng, quyển sách mỏng manh này lại chính là chìa khóa mở ra cánh cửa dẫn hắn bước vào một thế giới hoàn toàn khác biệt - thế giới Tu Tiên Giới khôn lường và tàn khốc!`,
      },
    ],
  },
  {
    id: 'novel-dau-pha-thuong-khung',
    title: 'Đấu Phá Thương Khung',
    slug: 'dau-pha-thuong-khung',
    author: 'Thiên Tằm Thổ Đậu',
    category: ['Huyền Huyễn', 'Dị Giới', 'Nhiệt Huyết'],
    coverUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    description: 'Đây là thế giới thuộc về Đấu Khí, không có ma pháp hoa lệ, chỉ có đấu khí phồn thịnh sinh sôi đến đỉnh điểm! Thiếu niên Tiêu Viêm từng là thiên tài vang danh bỗng chốc trở thành phế vật, bị vị hôn thê từ hôn nhục nhã. "Ba mươi năm Hà Đông, ba mươi năm Hà Tây, đừng khinh thiếu niên nghèo!", mang theo linh hồn Dược Lão, hắn bắt đầu hành trình nghịch thiên cải mệnh.',
    status: 'Hoàn thành',
    viewCount: 4510,
    linkedMovieSlug: 'dau-pha-thuong-khung',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    chapters: [
      {
        chapterNumber: 1,
        title: 'Chương 1: Phế Vật Thiên Tài',
        content: `"Đấu Chi Khí, ba đoạn!"

Nhìn bốn chữ to lớn sáng chói hiển thị trên Ma Thạch Bia thử nghiệm, thiếu niên đứng trên đài mặt không chút thay đổi, khóe miệng khẽ nhếch lên một nụ cười tự giễu. Bàn tay giấu trong tay áo siết chặt đến mức móng tay găm sâu vào da thịt, mang lại từng cơn đau nhói buốt.

"Tiêu Viêm, Đấu Chi Khí: Tam Đoạn! Cấp bậc: Cấp thấp!"

Bên cạnh bia đá, vị trung niên trắc thí viên liếc nhìn bảng điểm, giọng điệu hờ hững đọc to kết quả.

Lời vừa dứt, dưới quảng trường lập tức dấy lên một trận xôn xao chế giễu không hề kiêng nể:
"Ba đoạn? Ha ha, quả nhiên lại là ba đoạn! Tên này thật sự đã hoàn toàn biến thành phế vật rồi!"
"Ai mà ngờ được thiên tài trẻ tuổi nhất Ô Thản Thành năm mười một tuổi đột phá Đấu Giả, nay lại lưu lạc đến bước đường thảm hại thế này!"

Tiêu Viêm lẳng lặng xoay người, bước xuống lôi đài giữa muôn vàn ánh mắt khinh miệt và trào phúng. Hắn ngẩng đầu nhìn lên bầu trời đêm mênh mông, trong lòng gầm thét không cam tâm. Vì sao? Ba năm qua, đấu khí hắn khổ cực tu luyện được mỗi đêm đều biến mất không một dấu vết?!`,
      },
      {
        chapterNumber: 2,
        title: 'Chương 2: Vân Lam Tông Bức Hôn',
        content: `Đại sảnh Tiêu gia hôm nay không khí căng thẳng đến nghẹt thở.

Ba vị khách không mời mà đến ngồi ở vị trí danh dự bên trái đại sảnh. Dẫn đầu là một vị lão giả áo bào trắng thêu hình một thanh kiếm bạc sắc bén – biểu tượng của thế lực cự đầu Gia Mã Đế Quốc: Vân Lam Tông! Ngồi cạnh lão là một thiếu nữ tuyệt sắc thanh tú kiêu kỳ, mang tên Nạp Lan Yên Nhiên.

Gia chủ Tiêu Chiến ngồi trên chủ vị, sắc mặt âm trầm như nước.

"Tiêu thúc thúc, hôm nay Yên Nhiên mạo muội tới đây cùng Cát Diệp trưởng lão, kỳ thực là muốn bàn bạc về hôn ước năm xưa giữa con và Tiêu Viêm sư đệ..." Thiếu nữ cất giọng trong trẻo nhưng từng lời lại sắc lạnh như băng tuyết.

Nàng lấy ra một chiếc hộp ngọc tinh xảo, bên trong tỏa ra đan hương ngào ngạt:
"Đây là Tụ Khí Tán nhị phẩm đan dược, do Đan Vương Cổ Hà tự tay luyện chế. Yên Nhiên nguyện dâng tặng để bồi thường cho Tiêu gia, kính xin Tiêu thúc thúc đồng ý hủy bỏ mối hôn sự này!"

Từ hôn! Ngay trước mặt toàn thể trưởng lão và tộc nhân Tiêu gia!

Hành động này không khác gì một cái tát nảy lửa giáng thẳng vào mặt mũi của Tiêu gia và phụ thân Tiêu Chiến!`,
      },
      {
        chapterNumber: 3,
        title: 'Chương 3: Ba Mươi Năm Hà Đông, Đừng Khinh Thiếu Niên Nghèo!',
        content: `Đúng lúc Tiêu Chiến tức giận đến mức đấu khí toàn thân chực bùng nổ, một cánh tay thiếu niên bỗng đặt nhẹ lên vai ông.

Tiêu Viêm bước ra, ánh mắt bình thản như giếng cổ nhìn thẳng vào Nạp Lan Yên Nhiên:
"Nạp Lan tiểu thư, ngươi nghĩ rằng Tiêu gia ta cần viên đan dược bố thí này sao?"

Nạp Lan Yên Nhiên nhíu mày kiêu hãnh:
"Tiêu Viêm, ngươi nên thức thời một chút. Hiện tại ta đã là đệ tử thân truyền của Tông chủ Vân Lam Tông, tương lai bất khả hạn lượng. Còn ngươi... chỉ là một Đấu Chi Khí tam đoạn, cả đời này chúng ta vốn không cùng một thế giới!"

Tiêu Viêm nghe xong bỗng bật cười sảng khoái. Hắn rút đoản đao bên hông, cứa một đường vào lòng bàn tay, máu tươi chảy đầm đìa. 

Hắn giật phắt một mảnh áo vạt áo, dùng máu viết nên một phong hưu thư đỏ thẫm rồi ném thẳng xuống chân Nạp Lan Yên Nhiên!

"Nạp Lan Yên Nhiên! Ngươi nhớ kỹ cho ta, hôm nay không phải ngươi từ hôn Tiêu Viêm ta, mà là Tiêu Viêm ta HƯU NGƯƠI!"

Thiếu niên ưỡn thẳng lưng, giọng nói sang sảng vang vọng khắp đại sảnh Tiêu gia:
"Ba mươi năm Hà Đông, ba mươi năm Hà Tây, đừng khinh thiếu niên nghèo! Ba năm sau, Tiêu Viêm ta nhất định sẽ đích thân bước lên đỉnh Vân Lam Sơn, cùng ngươi quyết một trận thư hùng!"

Khí phách kinh thiên động địa khiến cả đại sảnh chấn động không một ai thốt nên lời!`,
      },
    ],
  },
];

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDirectory();
    this.data = this.loadData();
    this.cleanExpiredChatMessages();
  }

  private ensureDataDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  public getDbFilePath(): string {
    return DB_FILE;
  }

  private loadData(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          movies: parsed.movies || [],
          episodes: parsed.episodes || [],
          categories: parsed.categories || DEFAULT_CATEGORIES,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          chatMessages: parsed.chatMessages || [],
          feedbacks: parsed.feedbacks || [],
          memberSubmissions: parsed.memberSubmissions || [],
          novels: parsed.novels && parsed.novels.length > 0 ? parsed.novels : DEFAULT_NOVELS,
        };
      } catch (err) {
        console.error('Lỗi khi đọc file db.json, khởi tạo lại dữ liệu mặc định:', err);
      }
    }

    // Khởi tạo mới nếu chưa có
    const initialData: DatabaseSchema = {
      movies: [],
      episodes: [],
      categories: DEFAULT_CATEGORIES,
      settings: DEFAULT_SETTINGS,
      chatMessages: [],
      feedbacks: [],
      memberSubmissions: [],
      novels: DEFAULT_NOVELS,
    };
    this.saveDataDirect(initialData);
    return initialData;
  }

  private saveDataDirect(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data), 'utf-8');
      if ((global as any).gc) {
        try {
          (global as any).gc();
        } catch (e) {}
      }
    } catch (err) {
      console.error('Lỗi khi ghi dữ liệu ra db.json:', err);
    }
  }

  public save() {
    this.saveDataDirect(this.data);
  }

  // --- MOVIES ---
  public getMovies(options?: {
    includeHidden?: boolean;
    categorySlug?: string;
    search?: string;
    sort?: 'updated' | 'views' | 'az' | 'newest' | 'episodes';
    status?: string;
    limit?: number;
    featured?: boolean;
  }): Movie[] {
    let list = [...this.data.movies];

    if (!options?.includeHidden) {
      list = list.filter((m) => !m.hidden);
    }

    if (options?.categorySlug) {
      const targetCat = this.data.categories.find((c) => c.slug === options.categorySlug);
      if (targetCat) {
        list = list.filter((m) => m.category.includes(targetCat.name));
      }
    }

    if (options?.status) {
      list = list.filter((m) => m.status === options.status);
    }

    if (options?.featured !== undefined) {
      list = list.filter((m) => !!m.featured === options.featured);
    }

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.keywords.toLowerCase().includes(q) ||
          m.category.some((c) => c.toLowerCase().includes(q))
      );
    }

    // Sắp xếp
    const sortMode = options?.sort || 'updated';
    switch (sortMode) {
      case 'views':
        list.sort((a, b) => b.viewCount - a.viewCount);
        break;
      case 'az':
        list.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
        break;
      case 'newest':
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'episodes':
        list.sort((a, b) => b.episodeCount - a.episodeCount);
        break;
      case 'updated':
      default:
        list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
    }

    if (options?.limit && options.limit > 0) {
      return list.slice(0, options.limit);
    }

    return list;
  }

  public getMovieById(id: string): Movie | undefined {
    return this.data.movies.find((m) => m.id === id);
  }

  public getMovieBySlug(slug: string): Movie | undefined {
    return this.data.movies.find((m) => m.slug === slug);
  }

  public createMovie(payload: Omit<Movie, 'id' | 'createdAt' | 'updatedAt' | 'episodeCount' | 'latestEpisode' | 'viewCount'>): Movie {
    let slug = payload.slug ? generateSlug(payload.slug) : generateSlug(payload.title);
    // Kiểm tra trùng slug
    let uniqueSlug = slug;
    let counter = 1;
    while (this.data.movies.some((m) => m.slug === uniqueSlug)) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    const now = new Date().toISOString();
    const movie: Movie = {
      id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: payload.title.trim(),
      slug: uniqueSlug,
      description: payload.description?.trim() || '',
      posterUrl: payload.posterUrl?.trim() || '',
      bannerUrl: payload.bannerUrl?.trim() || payload.posterUrl?.trim() || '',
      category: Array.isArray(payload.category) ? payload.category : [payload.category].filter(Boolean),
      year: Number(payload.year) || new Date().getFullYear(),
      status: payload.status || 'Đang cập nhật',
      keywords: payload.keywords?.trim() || payload.title.trim(),
      seoTitle: payload.seoTitle?.trim() || `${payload.title.trim()} - Xem Phim Trọn Bộ`,
      seoDescription: payload.seoDescription?.trim() || payload.description?.slice(0, 160) || '',
      episodeCount: 0,
      latestEpisode: 0,
      viewCount: 0,
      hidden: payload.hidden || false,
      featured: payload.featured || false,
      createdAt: now,
      updatedAt: now,
    };

    this.data.movies.unshift(movie);
    this.save();
    return movie;
  }

  public updateMovie(id: string, payload: Partial<Movie>): Movie | null {
    const idx = this.data.movies.findIndex((m) => m.id === id);
    if (idx === -1) return null;

    const current = this.data.movies[idx];
    let newSlug = current.slug;
    if (payload.slug && payload.slug !== current.slug) {
      newSlug = generateSlug(payload.slug);
      let counter = 1;
      let checkSlug = newSlug;
      while (this.data.movies.some((m) => m.slug === checkSlug && m.id !== id)) {
        checkSlug = `${newSlug}-${counter}`;
        counter++;
      }
      newSlug = checkSlug;
    }

    this.data.movies[idx] = {
      ...current,
      ...payload,
      slug: newSlug,
      updatedAt: new Date().toISOString(),
    };

    this.save();
    return this.data.movies[idx];
  }

  public deleteMovie(id: string): boolean {
    const idx = this.data.movies.findIndex((m) => m.id === id);
    if (idx === -1) return false;

    this.data.movies.splice(idx, 1);
    // Xóa toàn bộ tập của phim
    this.data.episodes = this.data.episodes.filter((ep) => ep.movieId !== id);
    this.save();
    return true;
  }

  public incrementMovieView(movieId: string): void {
    const movie = this.data.movies.find((m) => m.id === movieId);
    if (movie) {
      movie.viewCount = (movie.viewCount || 0) + 1;
      this.save();
    }
  }

  // --- EPISODES ---
  public getEpisodesByMovieId(movieId: string): Episode[] {
    return this.data.episodes
      .filter((ep) => ep.movieId === movieId)
      .sort((a, b) => a.episodeNumber - b.episodeNumber);
  }

  public getEpisodeByNumber(movieId: string, episodeNumber: number): Episode | undefined {
    return this.data.episodes.find((ep) => ep.movieId === movieId && ep.episodeNumber === episodeNumber);
  }

  public createEpisode(payload: Omit<Episode, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>): Episode {
    const now = new Date().toISOString();
    const episode: Episode = {
      id: `ep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      movieId: payload.movieId,
      episodeNumber: Number(payload.episodeNumber),
      title: payload.title.trim() || `Tập ${payload.episodeNumber}`,
      youtubeUrl: payload.youtubeUrl.trim(),
      youtubeVideoId: payload.youtubeVideoId.trim(),
      youtubeEmbedUrl: payload.youtubeEmbedUrl.trim(),
      thumbnailUrl: payload.thumbnailUrl.trim() || `https://i.ytimg.com/vi/${payload.youtubeVideoId.trim()}/hqdefault.jpg`,
      viewCount: 0,
      servers: Array.isArray(payload.servers) ? payload.servers : [],
      createdAt: now,
      updatedAt: now,
    };

    // Kiểm tra xem đã có tập này chưa, nếu có thì ghi đè
    const existingIdx = this.data.episodes.findIndex(
      (ep) => ep.movieId === payload.movieId && ep.episodeNumber === episode.episodeNumber
    );
    if (existingIdx !== -1) {
      this.data.episodes[existingIdx] = episode;
    } else {
      this.data.episodes.push(episode);
    }

    this.syncMovieEpisodeStats(payload.movieId);
    this.save();
    return episode;
  }

  public createBulkEpisodes(
    movieId: string,
    episodesPayload: Array<{
      episodeNumber: number;
      title: string;
      youtubeUrl: string;
      youtubeVideoId: string;
      youtubeEmbedUrl: string;
      thumbnailUrl: string;
    }>
  ): Episode[] {
    const now = new Date().toISOString();
    const created: Episode[] = [];

    for (const item of episodesPayload) {
      const episode: Episode = {
        id: `ep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        movieId,
        episodeNumber: Number(item.episodeNumber),
        title: item.title.trim() || `Tập ${item.episodeNumber}`,
        youtubeUrl: item.youtubeUrl.trim(),
        youtubeVideoId: item.youtubeVideoId.trim(),
        youtubeEmbedUrl: item.youtubeEmbedUrl.trim(),
        thumbnailUrl: item.thumbnailUrl.trim() || `https://i.ytimg.com/vi/${item.youtubeVideoId.trim()}/hqdefault.jpg`,
        viewCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      const existingIdx = this.data.episodes.findIndex(
        (ep) => ep.movieId === movieId && ep.episodeNumber === episode.episodeNumber
      );
      if (existingIdx !== -1) {
        this.data.episodes[existingIdx] = episode;
      } else {
        this.data.episodes.push(episode);
      }
      created.push(episode);
    }

    this.syncMovieEpisodeStats(movieId);
    this.save();
    return created;
  }

  public updateEpisode(id: string, payload: Partial<Episode>): Episode | null {
    const idx = this.data.episodes.findIndex((ep) => ep.id === id);
    if (idx === -1) return null;

    const current = this.data.episodes[idx];
    this.data.episodes[idx] = {
      ...current,
      ...payload,
      updatedAt: new Date().toISOString(),
    };

    this.syncMovieEpisodeStats(current.movieId);
    this.save();
    return this.data.episodes[idx];
  }

  public deleteEpisode(id: string): boolean {
    const idx = this.data.episodes.findIndex((ep) => ep.id === id);
    if (idx === -1) return false;

    const movieId = this.data.episodes[idx].movieId;
    this.data.episodes.splice(idx, 1);
    this.syncMovieEpisodeStats(movieId);
    this.save();
    return true;
  }

  public incrementEpisodeView(episodeId: string): void {
    const ep = this.data.episodes.find((e) => e.id === episodeId);
    if (ep) {
      ep.viewCount = (ep.viewCount || 0) + 1;
      this.incrementMovieView(ep.movieId);
      this.save();
    }
  }

  private syncMovieEpisodeStats(movieId: string) {
    const movie = this.data.movies.find((m) => m.id === movieId);
    if (!movie) return;

    const movieEpisodes = this.data.episodes.filter((ep) => ep.movieId === movieId);
    movie.episodeCount = movieEpisodes.length;
    if (movieEpisodes.length > 0) {
      const maxEp = Math.max(...movieEpisodes.map((ep) => ep.episodeNumber));
      movie.latestEpisode = maxEp;
    } else {
      movie.latestEpisode = 0;
    }
    movie.updatedAt = new Date().toISOString();
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    return this.data.categories;
  }

  public createCategory(name: string): Category {
    const cat: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      slug: generateSlug(name),
    };
    this.data.categories.push(cat);
    this.save();
    return cat;
  }

  public deleteCategory(id: string): boolean {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    this.save();
    return true;
  }

  // --- SETTINGS ---
  public getSettings(): SiteSettings {
    return this.data.settings;
  }

  public updateSettings(payload: Partial<SiteSettings>): SiteSettings {
    this.data.settings = {
      ...this.data.settings,
      ...payload,
    };
    this.save();
    return this.data.settings;
  }

  // --- STATS ---
  public getStats() {
    const totalMovies = this.data.movies.length;
    const totalEpisodes = this.data.episodes.length;
    const totalViews = this.data.movies.reduce((acc, m) => acc + (m.viewCount || 0), 0);
    const recentMovies = this.getMovies({ limit: 5, sort: 'newest', includeHidden: true });
    const topMovies = this.getMovies({ limit: 5, sort: 'views', includeHidden: true });

    return {
      totalMovies,
      totalEpisodes,
      totalViews,
      recentMovies,
      topMovies,
    };
  }

  // --- BACKUP & RESTORE ---
  public exportDatabase(): DatabaseSchema {
    if (!this.data.novels || this.data.novels.length === 0) {
      this.data.novels = DEFAULT_NOVELS;
    }
    return this.data;
  }

  public importDatabase(newData: any): boolean {
    if (!newData || !Array.isArray(newData.movies) || !Array.isArray(newData.episodes)) {
      return false;
    }
    this.data = {
      movies: newData.movies,
      episodes: newData.episodes,
      categories: Array.isArray(newData.categories) ? newData.categories : DEFAULT_CATEGORIES,
      settings: { ...DEFAULT_SETTINGS, ...(newData.settings || {}) },
      chatMessages: Array.isArray(newData.chatMessages) ? newData.chatMessages : (this.data.chatMessages || []),
      feedbacks: Array.isArray(newData.feedbacks) ? newData.feedbacks : (this.data.feedbacks || []),
      memberSubmissions: Array.isArray(newData.memberSubmissions) ? newData.memberSubmissions : (this.data.memberSubmissions || []),
      novels: Array.isArray(newData.novels) && newData.novels.length > 0 ? newData.novels : (this.data.novels || DEFAULT_NOVELS),
    };
    this.save();
    return true;
  }

  public importNovels(novels: Novel[]): boolean {
    if (!Array.isArray(novels)) return false;
    if (!this.data.novels) this.data.novels = [];

    const novelMap = new Map<string, Novel>();
    this.data.novels.forEach((n) => novelMap.set(n.slug || n.id, n));
    novels.forEach((n) => novelMap.set(n.slug || n.id, n));

    this.data.novels = Array.from(novelMap.values());
    this.save();
    return true;
  }

  // --- CHAT MESSAGES (Tự động xóa sau 7 ngày) ---
  private cleanExpiredChatMessages(): void {
    if (!this.data || !this.data.chatMessages) return;
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày = 604.800.000 ms
    const now = Date.now();
    const originalLength = this.data.chatMessages.length;
    this.data.chatMessages = this.data.chatMessages.filter((msg) => {
      const msgTime = new Date(msg.createdAt).getTime();
      return !isNaN(msgTime) && (now - msgTime < SEVEN_DAYS_MS);
    });
    if (this.data.chatMessages.length !== originalLength) {
      this.save();
    }
  }

  public getChatMessages(limit = 60): ChatMessage[] {
    this.cleanExpiredChatMessages();
    const messages = this.data.chatMessages || [];
    return messages.slice(-limit);
  }

  public addChatMessage(payload: { senderName: string; content: string; senderBadge?: string; avatarColor?: string; avatar?: string }): ChatMessage {
    this.cleanExpiredChatMessages();
    if (!this.data.chatMessages) this.data.chatMessages = [];
    const msg: ChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderName: payload.senderName.trim().slice(0, 30) || 'Thành viên',
      senderBadge: payload.senderBadge || 'Thành viên',
      avatarColor: payload.avatarColor || '#2563eb',
      avatar: payload.avatar || '🦁',
      content: payload.content.trim().slice(0, 500),
      createdAt: new Date().toISOString(),
    };
    this.data.chatMessages.push(msg);
    // Giữ tối đa 300 tin nhắn gần nhất trong vòng 7 ngày
    if (this.data.chatMessages.length > 300) {
      this.data.chatMessages = this.data.chatMessages.slice(-300);
    }
    this.save();
    return msg;
  }

  public deleteChatMessage(id: string): boolean {
    if (!this.data.chatMessages) return false;
    const idx = this.data.chatMessages.findIndex(m => m.id === id);
    if (idx === -1) return false;
    this.data.chatMessages.splice(idx, 1);
    this.save();
    return true;
  }

  // --- FEEDBACK & BUG REPORT ---
  public getFeedbacks(): FeedbackItem[] {
    return (this.data.feedbacks || []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createFeedback(payload: Omit<FeedbackItem, 'id' | 'status' | 'createdAt'>): FeedbackItem {
    if (!this.data.feedbacks) this.data.feedbacks = [];
    const item: FeedbackItem = {
      id: `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: payload.name?.trim() || 'Khán giả ẩn danh',
      contact: payload.contact?.trim() || '',
      type: payload.type || 'Góp ý tính năng',
      movieTitle: payload.movieTitle?.trim() || '',
      episodeNumber: payload.episodeNumber ? Number(payload.episodeNumber) : undefined,
      content: payload.content.trim(),
      status: 'Chờ xử lý',
      createdAt: new Date().toISOString(),
    };
    this.data.feedbacks.unshift(item);
    this.save();
    return item;
  }

  public updateFeedbackStatus(id: string, status: 'Chờ xử lý' | 'Đã xử lý'): boolean {
    if (!this.data.feedbacks) return false;
    const item = this.data.feedbacks.find(f => f.id === id);
    if (!item) return false;
    item.status = status;
    this.save();
    return true;
  }

  public deleteFeedback(id: string): boolean {
    if (!this.data.feedbacks) return false;
    const idx = this.data.feedbacks.findIndex(f => f.id === id);
    if (idx === -1) return false;
    this.data.feedbacks.splice(idx, 1);
    this.save();
    return true;
  }

  // --- MEMBER MOVIE SUBMISSIONS ---
  public getMemberSubmissions(status?: string): MemberMovieSubmission[] {
    let list = this.data.memberSubmissions || [];
    if (status) {
      list = list.filter(s => s.status === status);
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createMemberSubmission(payload: Omit<MemberMovieSubmission, 'id' | 'status' | 'viewCount' | 'createdAt' | 'updatedAt'>): MemberMovieSubmission {
    if (!this.data.memberSubmissions) this.data.memberSubmissions = [];
    const now = new Date().toISOString();
    const submission: MemberMovieSubmission = {
      ...payload,
      id: `mmsub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: payload.title.trim(),
      slug: generateSlug(payload.title),
      contributorName: payload.contributorName?.trim() || 'Hội viên ẩn danh',
      status: 'Chờ duyệt',
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.data.memberSubmissions.unshift(submission);
    this.save();
    return submission;
  }

  public approveMemberSubmission(id: string, parsedVideo: any): { success: boolean; movie?: Movie; error?: string } {
    if (!this.data.memberSubmissions) return { success: false, error: 'Không tìm thấy dữ liệu đóng góp.' };
    const sub = this.data.memberSubmissions.find(s => s.id === id);
    if (!sub) return { success: false, error: 'Không tìm thấy phim đóng góp này.' };

    const categories = Array.from(new Set(['Phim Hội Viên', ...(sub.category || [])]));
    const movie = this.createMovie({
      title: sub.title,
      slug: sub.slug,
      description: `${sub.description || ''}\n\n[ Phim do Hội viên "${sub.contributorName}" đóng góp cho cộng đồng PHIM HAY 247 ]`,
      posterUrl: sub.posterUrl || parsedVideo?.thumbnailUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
      bannerUrl: sub.posterUrl || parsedVideo?.thumbnailUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200',
      category: categories,
      year: new Date().getFullYear(),
      status: 'Hoàn thành',
      keywords: `${sub.title}, phim hoi vien, ${sub.contributorName}`,
      seoTitle: `${sub.title} - Phim Hội Viên Đóng Góp`,
      seoDescription: sub.description || `${sub.title} do thành viên ${sub.contributorName} chia sẻ trên PHIM HAY 247.`,
      featured: true,
      hidden: false,
    });

    const episodesList = sub.episodes && sub.episodes.length > 0
      ? sub.episodes
      : [{ episodeNumber: 1, title: 'Tập 1', videoUrl: sub.videoUrl }];

    episodesList.forEach((ep, idx) => {
      const parsedEp = parseYouTubeUrl(ep.videoUrl);
      const epData = parsedEp.success ? parsedEp.data : parsedVideo;
      const epNum = Number(ep.episodeNumber) || (idx + 1);
      const epTitle = ep.title?.trim() || `Tập ${epNum}`;

      this.createEpisode({
        movieId: movie.id,
        episodeNumber: epNum,
        title: epTitle,
        youtubeUrl: epData.watchUrl,
        youtubeVideoId: epData.videoId,
        youtubeEmbedUrl: epData.embedUrl,
        thumbnailUrl: epData.thumbnailUrl,
        servers: [
          {
            id: `srv-${Date.now()}-${idx}`,
            name: `Server 1 (${epData.platformName || 'HD'})`,
            url: epData.watchUrl,
            videoId: epData.videoId,
            embedUrl: epData.embedUrl,
            platform: epData.videoType || 'youtube',
          },
        ],
      });
    });

    sub.status = 'Đã duyệt';
    sub.approvedMovieId = movie.id;
    sub.updatedAt = new Date().toISOString();
    this.save();

    return { success: true, movie };
  }

  public rejectMemberSubmission(id: string, reason?: string): boolean {
    if (!this.data.memberSubmissions) return false;
    const sub = this.data.memberSubmissions.find(s => s.id === id);
    if (!sub) return false;
    sub.status = 'Từ chối';
    if (reason) {
      sub.rejectionReason = reason;
    }
    sub.updatedAt = new Date().toISOString();
    this.save();
    return true;
  }

  public deleteMemberSubmission(id: string): boolean {
    if (!this.data.memberSubmissions) return false;
    const idx = this.data.memberSubmissions.findIndex(s => s.id === id);
    if (idx === -1) return false;
    this.data.memberSubmissions.splice(idx, 1);
    this.save();
    return true;
  }

  // ==================== NOVELS (TRUYỆN CHỮ) ====================
  public getNovels(filter?: { category?: string; query?: string }): Novel[] {
    if (!this.data.novels || this.data.novels.length === 0) {
      this.data.novels = DEFAULT_NOVELS;
      this.save();
    }
    let list = [...this.data.novels];
    if (filter?.category && filter.category !== 'all') {
      list = list.filter((n) => n.category && n.category.includes(filter.category!));
    }
    if (filter?.query) {
      const q = filter.query.toLowerCase().trim();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.author.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getNovelBySlug(slug: string): Novel | null {
    if (!this.data.novels || this.data.novels.length === 0) {
      this.data.novels = DEFAULT_NOVELS;
      this.save();
    }
    return this.data.novels.find((n) => n.slug === slug) || null;
  }

  public getNovelById(id: string): Novel | null {
    if (!this.data.novels) return null;
    return this.data.novels.find((n) => n.id === id) || null;
  }

  public createNovel(novelData: Partial<Novel>): Novel {
    if (!this.data.novels) this.data.novels = [];
    const now = new Date().toISOString();
    const id = `novel-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const slug = novelData.slug || generateSlug(novelData.title || '') || id;

    const newNovel: Novel = {
      id,
      title: novelData.title || 'Truyện Mới',
      slug,
      author: novelData.author || 'Đang cập nhật',
      category: novelData.category || ['Tiên Hiệp'],
      coverUrl: novelData.coverUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
      description: novelData.description || '',
      status: novelData.status || 'Đang ra',
      viewCount: 0,
      linkedMovieSlug: novelData.linkedMovieSlug || '',
      sourceUrl: novelData.sourceUrl || '',
      chapters: novelData.chapters || [],
      createdAt: now,
      updatedAt: now,
    };

    this.data.novels.unshift(newNovel);
    this.save();
    return newNovel;
  }

  public updateNovel(id: string, update: Partial<Novel>): Novel | null {
    if (!this.data.novels) return null;
    const index = this.data.novels.findIndex((n) => n.id === id);
    if (index === -1) return null;

    const existing = this.data.novels[index];
    const updated: Novel = {
      ...existing,
      ...update,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    };
    if (update.title && !update.slug) {
      updated.slug = generateSlug(update.title);
    }
    this.data.novels[index] = updated;
    this.save();
    return updated;
  }

  public deleteNovel(id: string): boolean {
    if (!this.data.novels) return false;
    const index = this.data.novels.findIndex((n) => n.id === id);
    if (index === -1) return false;
    this.data.novels.splice(index, 1);
    this.save();
    return true;
  }

  public addChapter(novelId: string, chapter: Chapter): boolean {
    if (!this.data.novels) return false;
    const novel = this.data.novels.find((n) => n.id === novelId);
    if (!novel) return false;

    if (!novel.chapters) novel.chapters = [];
    const existIdx = novel.chapters.findIndex((c) => c.chapterNumber === chapter.chapterNumber);
    if (existIdx !== -1) {
      novel.chapters[existIdx] = { ...chapter, createdAt: new Date().toISOString() };
    } else {
      novel.chapters.push({ ...chapter, createdAt: new Date().toISOString() });
    }
    novel.chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
    novel.updatedAt = new Date().toISOString();
    this.save();
    return true;
  }

  public importChapters(novelId: string, chapters: Chapter[]): boolean {
    if (!this.data.novels || !chapters || chapters.length === 0) return false;
    const novel = this.data.novels.find((n) => n.id === novelId);
    if (!novel) return false;

    if (!novel.chapters) novel.chapters = [];
    for (const ch of chapters) {
      const existIdx = novel.chapters.findIndex((c) => c.chapterNumber === ch.chapterNumber);
      if (existIdx !== -1) {
        novel.chapters[existIdx] = { ...ch, createdAt: new Date().toISOString() };
      } else {
        novel.chapters.push({ ...ch, createdAt: new Date().toISOString() });
      }
    }
    novel.chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
    novel.updatedAt = new Date().toISOString();
    this.save();
    return true;
  }

  public deleteChapter(novelId: string, chapterNumber: number): boolean {
    if (!this.data.novels) return false;
    const novel = this.data.novels.find((n) => n.id === novelId);
    if (!novel || !novel.chapters) return false;
    const idx = novel.chapters.findIndex((c) => c.chapterNumber === chapterNumber);
    if (idx === -1) return false;
    novel.chapters.splice(idx, 1);
    novel.updatedAt = new Date().toISOString();
    this.save();
    return true;
  }

  public incrementNovelViews(slug: string): void {
    if (!this.data.novels) return;
    const novel = this.data.novels.find((n) => n.slug === slug);
    if (novel) {
      novel.viewCount = (novel.viewCount || 0) + 1;
      this.save();
    }
  }
}

export const db = new DatabaseService();
