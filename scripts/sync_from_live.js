import fs from 'fs';
import path from 'path';

async function syncFromLive() {
  const liveUrl = process.env.LIVE_SITE_URL || 'https://phimcongdong.com/api/settings/export-db';
  console.log(`[DONG BO] Dang kiem tra du lieu tu: ${liveUrl}...`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(liveUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      console.log(`[CANH BAO] Khong the ket noi website live (HTTP ${res.status}). Giu nguyen du lieu cuc bo.`);
      return;
    }

    const liveDb = await res.json();
    const localDbPath = path.resolve('server/data/db.json');
    if (!fs.existsSync(localDbPath)) {
      console.log('[LOI] Khong tim thay server/data/db.json.');
      return;
    }

    const localDb = JSON.parse(fs.readFileSync(localDbPath, 'utf-8'));

    let newSubmissionsCount = 0;
    let newMoviesCount = 0;
    let newFeedbacksCount = 0;

    // 1. Dong bo memberSubmissions tu Live ve Local
    if (Array.isArray(liveDb.memberSubmissions)) {
      if (!Array.isArray(localDb.memberSubmissions)) localDb.memberSubmissions = [];
      liveDb.memberSubmissions.forEach((liveSub) => {
        const exists = localDb.memberSubmissions.some(
          (s) => s.id === liveSub.id || (s.title === liveSub.title && s.videoUrl === liveSub.videoUrl)
        );
        if (!exists) {
          localDb.memberSubmissions.unshift(liveSub);
          newSubmissionsCount++;
        } else {
          // Cap nhat trang thai neu tren live da duyet hoac tu choi
          const localItem = localDb.memberSubmissions.find((s) => s.id === liveSub.id);
          if (localItem && liveSub.status && localItem.status !== liveSub.status) {
            localItem.status = liveSub.status;
            localItem.approvedMovieId = liveSub.approvedMovieId;
            localItem.rejectionReason = liveSub.rejectionReason;
          }
        }
      });
    }

    // 2. Dong bo movies moi tu Live ve Local (phim do admin duyet tren web live)
    if (Array.isArray(liveDb.movies)) {
      if (!Array.isArray(localDb.movies)) localDb.movies = [];
      liveDb.movies.forEach((liveMovie) => {
        const exists = localDb.movies.some((m) => m.id === liveMovie.id || m.slug === liveMovie.slug);
        if (!exists) {
          localDb.movies.unshift(liveMovie);
          newMoviesCount++;
        }
      });
    }

    // 3. Dong bo episodes moi tu Live ve Local
    if (Array.isArray(liveDb.episodes)) {
      if (!Array.isArray(localDb.episodes)) localDb.episodes = [];
      liveDb.episodes.forEach((liveEp) => {
        const exists = localDb.episodes.some((e) => e.id === liveEp.id);
        if (!exists) {
          localDb.episodes.push(liveEp);
        }
      });
    }

    // 4. Dong bo feedbacks moi tu Live ve Local
    if (Array.isArray(liveDb.feedbacks)) {
      if (!Array.isArray(localDb.feedbacks)) localDb.feedbacks = [];
      liveDb.feedbacks.forEach((liveFb) => {
        const exists = localDb.feedbacks.some((f) => f.id === liveFb.id);
        if (!exists) {
          localDb.feedbacks.unshift(liveFb);
          newFeedbacksCount++;
        }
      });
    }

    // Ghi de an toan vao db.json cuc bo
    fs.writeFileSync(localDbPath, JSON.stringify(localDb, null, 2), 'utf-8');

    console.log(`[THANH CONG] Da dong bo an toan tu website live:`);
    console.log(`  + Dong gop hoi vien moi: ${newSubmissionsCount}`);
    console.log(`  + Phim moi: ${newMoviesCount}`);
    console.log(`  + Y kien dong gop moi: ${newFeedbacksCount}`);
    console.log(`Du lieu tren may tinh da duoc hop nhat an toan!`);
  } catch (err) {
    console.log(`[GHI CHU] Khong the ket noi website live (${err.message}). Giu nguyen du lieu may tinh.`);
  }
}

syncFromLive();
