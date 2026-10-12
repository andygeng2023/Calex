(function () {
  "use strict";

  const STORAGE_KEY = "calex-language-v1";
  const LANGUAGE_ORDER = ["en", "es", "fr", "de", "zh", "ja", "ko"];
  const LANGUAGES = {
    en: { label: "English", locale: "en-GB" },
    es: { label: "Español", locale: "es-ES" },
    fr: { label: "Français", locale: "fr-FR" },
    de: { label: "Deutsch", locale: "de-DE" },
    zh: { label: "中文", locale: "zh-CN" },
    ja: { label: "日本語", locale: "ja-JP" },
    ko: { label: "한국어", locale: "ko-KR" },
  };

  // Locally bundled phrase translations for Chinese, Japanese, and Korean.
  // No interface text is sent to a translation service.
  const ASIAN_TRANSLATIONS = {
  "Skip to calendar": [
    "跳转到日历",
    "カレンダーに移動",
    "캘린더로 이동"
  ],
  "YOUR TIME, WELL SPENT": [
    "善用你的时间",
    "時間を有効に",
    "시간을 알차게"
  ],
  "Your day, at a glance": [
    "一览你的一天",
    "今日の予定をひと目で",
    "한눈에 보는 하루"
  ],
  "On this device": [
    "在此设备上",
    "このデバイス上",
    "이 기기에서"
  ],
  "Ask assistant": [
    "询问助手",
    "アシスタントに質問",
    "어시스턴트에게 질문"
  ],
  "New event": [
    "新建事件",
    "新しい予定",
    "새 일정"
  ],
  "MAKE ROOM FOR WHAT MATTERS": [
    "为重要的事留出时间",
    "大切なことのために時間を",
    "중요한 일에 시간을"
  ],
  "Monday": [
    "星期一",
    "月曜日",
    "월요일"
  ],
  "Quick add": [
    "快速添加",
    "クイック追加",
    "빠른 추가"
  ],
  "Today": [
    "今天",
    "今日",
    "오늘"
  ],
  "Tomorrow": [
    "明天",
    "明日",
    "내일"
  ],
  "Coming up": [
    "即将到来",
    "近日の予定",
    "다가오는 일정"
  ],
  "Mon": [
    "周一",
    "月",
    "월"
  ],
  "Tue": [
    "周二",
    "火",
    "화"
  ],
  "Wed": [
    "周三",
    "水",
    "수"
  ],
  "Thu": [
    "周四",
    "木",
    "목"
  ],
  "Fri": [
    "周五",
    "金",
    "금"
  ],
  "Sat": [
    "周六",
    "土",
    "토"
  ],
  "Sun": [
    "周日",
    "日",
    "일"
  ],
  "Selected day": [
    "所选日期",
    "選択した日",
    "선택한 날짜"
  ],
  "Quick event": [
    "快速事件",
    "クイック予定",
    "빠른 일정"
  ],
  "Add event": [
    "添加事件",
    "予定を追加",
    "일정 추가"
  ],
  "LOOKING AHEAD": [
    "提前规划",
    "これからの予定",
    "미리 보기"
  ],
  "Your next 30 days": [
    "未来30天",
    "今後30日間",
    "앞으로 30일"
  ],
  "A little perspective for everything on your calendar.": [
    "一览日历中的所有安排。",
    "カレンダーの予定を見渡しましょう。",
    "캘린더의 모든 일정을 한눈에 확인하세요."
  ],
  "Back to today": [
    "返回今天",
    "今日に戻る",
    "오늘로 돌아가기"
  ],
  "Settings": [
    "设置",
    "設定",
    "설정"
  ],
  "Your Calex account": [
    "你的 Calex 账户",
    "Calex アカウント",
    "Calex 계정"
  ],
  "Sign in or create an account to securely sync your calendar across devices.": [
    "登录或创建账户，以便在不同设备间安全同步日历。",
    "サインインまたはアカウントを作成して、デバイス間でカレンダーを安全に同期します。",
    "로그인하거나 계정을 만들어 여러 기기에서 캘린더를 안전하게 동기화하세요."
  ],
  "Not signed in · using this device": [
    "未登录 · 正在使用此设备",
    "未サインイン · このデバイスを使用中",
    "로그아웃 상태 · 이 기기 사용 중"
  ],
  "Open live Calex to sign in": [
    "打开 Calex 网站以登录",
    "Calex のウェブサイトを開いてサインイン",
    "로그인하려면 Calex 웹사이트 열기"
  ],
  "Continue with Google": [
    "使用 Google 继续",
    "Google で続行",
    "Google로 계속"
  ],
  "Email": [
    "电子邮件",
    "メールアドレス",
    "이메일"
  ],
  "Password": [
    "密码",
    "パスワード",
    "비밀번호"
  ],
  "Sign in": [
    "登录",
    "サインイン",
    "로그인"
  ],
  "Create account": [
    "创建账户",
    "アカウントを作成",
    "계정 만들기"
  ],
  "Forgot password?": [
    "忘记密码？",
    "パスワードをお忘れですか？",
    "비밀번호를 잊으셨나요?"
  ],
  "Resend confirmation email": [
    "重新发送确认邮件",
    "確認メールを再送信",
    "확인 이메일 다시 보내기"
  ],
  "Sign out": [
    "退出登录",
    "サインアウト",
    "로그아웃"
  ],
  "New password": [
    "新密码",
    "新しいパスワード",
    "새 비밀번호"
  ],
  "Confirm password": [
    "确认密码",
    "パスワードを確認",
    "비밀번호 확인"
  ],
  "Set password": [
    "设置密码",
    "パスワードを設定",
    "비밀번호 설정"
  ],
  "CALEX PREFERENCES": [
    "CALEX 偏好设置",
    "CALEX の設定",
    "CALEX 환경설정"
  ],
  "Make Calex work the way you do.": [
    "按你的习惯使用 Calex。",
    "自分に合った Calex にしましょう。",
    "내 방식에 맞게 Calex를 설정하세요."
  ],
  "Your profile": [
    "个人资料",
    "プロフィール",
    "프로필"
  ],
  "Your name": [
    "你的姓名",
    "名前",
    "이름"
  ],
  "Add your location": [
    "添加所在地",
    "場所を追加",
    "위치 추가"
  ],
  "Edit profile details": [
    "编辑个人资料",
    "プロフィールを編集",
    "프로필 정보 수정"
  ],
  "Display name": [
    "显示名称",
    "表示名",
    "표시 이름"
  ],
  "Location": [
    "位置",
    "場所",
    "위치"
  ],
  "City or region": [
    "城市或地区",
    "都市または地域",
    "도시 또는 지역"
  ],
  "Save profile": [
    "保存个人资料",
    "プロフィールを保存",
    "프로필 저장"
  ],
  "Account & sync": [
    "账户与同步",
    "アカウントと同期",
    "계정 및 동기화"
  ],
  "Preferences": [
    "偏好设置",
    "環境設定",
    "환경설정"
  ],
  "Time zone": [
    "时区",
    "タイムゾーン",
    "시간대"
  ],
  "Automatic · device time zone": [
    "自动 · 设备时区",
    "自動 · デバイスのタイムゾーン",
    "자동 · 기기 시간대"
  ],
  "Automatic": [
    "自动",
    "自動",
    "자동"
  ],
  "Choose time zone": [
    "选择时区",
    "タイムゾーンを選択",
    "시간대 선택"
  ],
  "Search by city or region": [
    "按城市或地区搜索",
    "都市または地域で検索",
    "도시 또는 지역 검색"
  ],
  "Matching time zones": [
    "匹配的时区",
    "一致するタイムゾーン",
    "일치하는 시간대"
  ],
  "Time zone mode": [
    "时区模式",
    "タイムゾーン設定",
    "시간대 모드"
  ],
  "Automatic mode follows the time zone configured on this device.": [
    "自动模式会使用此设备设置的时区。",
    "自動モードでは、このデバイスに設定されたタイムゾーンを使用します。",
    "자동 모드는 이 기기에 설정된 시간대를 따릅니다."
  ],
  "Save time zone": [
    "保存时区",
    "タイムゾーンを保存",
    "시간대 저장"
  ],
  "Dark appearance": [
    "深色外观",
    "ダーク表示",
    "어두운 화면"
  ],
  "Adjust the interface for low-light environments": [
    "调整界面以适应低光环境",
    "暗い場所に合わせて画面を調整します",
    "어두운 환경에 맞게 화면을 조정합니다"
  ],
  "Language": [
    "语言",
    "言語",
    "언어"
  ],
  "Choose your language": [
    "选择语言",
    "言語を選択",
    "언어 선택"
  ],
  "Display language": [
    "显示语言",
    "表示言語",
    "표시 언어"
  ],
  "Your interface language is saved with your preferences.": [
    "界面语言会与偏好设置一起保存。",
    "表示言語は設定とともに保存されます。",
    "인터페이스 언어는 환경설정과 함께 저장됩니다."
  ],
  "Auto · System settings": [
    "自动 · 系统设置",
    "自動 · システム設定",
    "자동 · 시스템 설정"
  ],
  "System language": [
    "系统语言",
    "システム言語",
    "시스템 언어"
  ],
  "Search languages": [
    "搜索语言",
    "言語を検索",
    "언어 검색"
  ],
  "No matching languages.": [
    "没有匹配的语言。",
    "一致する言語がありません。",
    "일치하는 언어가 없습니다."
  ],
  "Using": [
    "正在使用",
    "使用中",
    "사용 중"
  ],
  "on": [
    "开启",
    "オン",
    "켜짐"
  ],
  "off": [
    "关闭",
    "オフ",
    "꺼짐"
  ],
  "Your data": [
    "你的数据",
    "データ",
    "데이터"
  ],
  "Export calendar": [
    "导出日历",
    "カレンダーをエクスポート",
    "캘린더 내보내기"
  ],
  "Download a portable .ics calendar file": [
    "下载可移植的 .ics 日历文件",
    "持ち運び可能な .ics カレンダーファイルをダウンロード",
    "이동 가능한 .ics 캘린더 파일 다운로드"
  ],
  "Import calendar": [
    "导入日历",
    "カレンダーをインポート",
    "캘린더 가져오기"
  ],
  "About & legal": [
    "关于与法律信息",
    "情報と法的事項",
    "정보 및 법적 고지"
  ],
  "About Calex": [
    "关于 Calex",
    "Calex について",
    "Calex 정보"
  ],
  "What Calex does and how to get help": [
    "Calex 的功能及获取帮助的方式",
    "Calex の機能とヘルプの利用方法",
    "Calex 기능 및 도움말"
  ],
  "Overview": [
    "概览",
    "概要",
    "개요"
  ],
  "Calendar": [
    "日历",
    "カレンダー",
    "캘린더"
  ],
  "Agenda": [
    "日程",
    "予定一覧",
    "일정"
  ],
  "MY CALENDARS": [
    "我的日历",
    "マイカレンダー",
    "내 캘린더"
  ],
  "Personal": [
    "个人",
    "個人",
    "개인"
  ],
  "Work & study": [
    "工作与学习",
    "仕事と学習",
    "업무 및 학습"
  ],
  "Wellbeing": [
    "身心健康",
    "ウェルビーイング",
    "웰빙"
  ],
  "Install Calex": [
    "安装 Calex",
    "Calex をインストール",
    "Calex 설치"
  ],
  "Saved on this device": [
    "已保存在此设备",
    "このデバイスに保存済み",
    "이 기기에 저장됨"
  ],
  "Describe your event": [
    "描述你的事件",
    "予定を入力",
    "일정 설명"
  ],
  "Start typing to see the preview...": [
    "开始输入以查看预览…",
    "入力するとプレビューが表示されます…",
    "입력을 시작하면 미리보기가 표시됩니다…"
  ],
  "Date *": [
    "日期 *",
    "日付 *",
    "날짜 *"
  ],
  "Start time": [
    "开始时间",
    "開始時刻",
    "시작 시간"
  ],
  "End time": [
    "结束时间",
    "終了時刻",
    "종료 시간"
  ],
  "Repeat": [
    "重复",
    "繰り返し",
    "반복"
  ],
  "Never": [
    "从不",
    "なし",
    "안 함"
  ],
  "Every day": [
    "每天",
    "毎日",
    "매일"
  ],
  "Every week": [
    "每周",
    "毎週",
    "매주"
  ],
  "Every fortnight": [
    "每两周",
    "隔週",
    "격주"
  ],
  "Every month": [
    "每月",
    "毎月",
    "매월"
  ],
  "Every year": [
    "每年",
    "毎年",
    "매년"
  ],
  "People": [
    "人员",
    "参加者",
    "참여자"
  ],
  "Notes": [
    "备注",
    "メモ",
    "메모"
  ],
  "Save event": [
    "保存事件",
    "予定を保存",
    "일정 저장"
  ],
  "Calex assistant": [
    "Calex 助手",
    "Calex アシスタント",
    "Calex 어시스턴트"
  ],
  "Plan my day": [
    "规划我的一天",
    "今日の予定を立てる",
    "하루 계획 세우기"
  ],
  "Find focus time": [
    "寻找专注时间",
    "集中できる時間を探す",
    "집중 시간 찾기"
  ],
  "Create an event": [
    "创建事件",
    "予定を作成",
    "일정 만들기"
  ],
  "Message the assistant": [
    "给助手发消息",
    "アシスタントにメッセージ",
    "어시스턴트에게 메시지"
  ],
  "Search calendar": [
    "搜索日历",
    "カレンダーを検索",
    "캘린더 검색"
  ],
  "Go to today": [
    "转到今天",
    "今日へ移動",
    "오늘로 이동"
  ],
  "Month / week / year": [
    "月 / 周 / 年",
    "月 / 週 / 年",
    "월 / 주 / 년"
  ],
  "Close dialog": [
    "关闭对话框",
    "ダイアログを閉じる",
    "대화상자 닫기"
  ],
  "My calendars": [
    "我的日历",
    "マイカレンダー",
    "내 캘린더"
  ],
  "Full dates": [
    "完整日期",
    "全日付",
    "전체 날짜"
  ],
  "Month": [
    "月",
    "月",
    "월"
  ],
  "Week": [
    "周",
    "週",
    "주"
  ],
  "View": [
    "视图",
    "表示",
    "보기"
  ],
  "view": [
    "视图",
    "表示",
    "보기"
  ],
  "Events": [
    "事件",
    "予定",
    "일정"
  ],
  "event": [
    "事件",
    "予定",
    "일정"
  ],
  "events": [
    "个事件",
    "件の予定",
    "개 일정"
  ],
  "To do": [
    "待办",
    "未完了",
    "할 일"
  ],
  "Completed": [
    "已完成",
    "完了",
    "완료"
  ],
  "Nothing planned for this day.": [
    "这一天没有安排。",
    "この日の予定はありません。",
    "이 날짜에 예정된 일정이 없습니다."
  ],
  "Completed events will appear here.": [
    "已完成的事件会显示在这里。",
    "完了した予定がここに表示されます。",
    "완료한 일정이 여기에 표시됩니다."
  ],
  "No events planned for this day.": [
    "这一天没有计划。",
    "この日の予定はありません。",
    "이 날짜에 계획된 일정이 없습니다."
  ],
  "All day": [
    "全天",
    "終日",
    "하루 종일"
  ],
  "Until": [
    "直到",
    "まで",
    "까지"
  ],
  "With": [
    "与",
    "と",
    "함께"
  ],
  "Repeat daily": [
    "每天重复",
    "毎日繰り返す",
    "매일 반복"
  ],
  "Repeats daily": [
    "每天重复",
    "毎日繰り返し",
    "매일 반복"
  ],
  "Repeats weekly": [
    "每周重复",
    "毎週繰り返し",
    "매주 반복"
  ],
  "Repeats monthly": [
    "每月重复",
    "毎月繰り返し",
    "매월 반복"
  ],
  "Repeats yearly": [
    "每年重复",
    "毎年繰り返し",
    "매년 반복"
  ],
  "Delete event": [
    "删除事件",
    "予定を削除",
    "일정 삭제"
  ],
  "Edit event": [
    "编辑事件",
    "予定を編集",
    "일정 수정"
  ],
  "No matching events or dates.": [
    "没有匹配的事件或日期。",
    "一致する予定や日付がありません。",
    "일치하는 일정이나 날짜가 없습니다."
  ],
  "No matching time zones. Try a city or region name.": [
    "没有匹配的时区。请尝试城市或地区名称。",
    "一致するタイムゾーンがありません。都市名や地域名をお試しください。",
    "일치하는 시간대가 없습니다. 도시 또는 지역 이름을 입력하세요."
  ],
  "Choose a time zone from the search results.": [
    "请从搜索结果中选择时区。",
    "検索結果からタイムゾーンを選択してください。",
    "검색 결과에서 시간대를 선택하세요."
  ],
  "Time zone preference saved": [
    "时区偏好已保存",
    "タイムゾーン設定を保存しました",
    "시간대 설정이 저장됨"
  ],
  "Profile saved": [
    "个人资料已保存",
    "プロフィールを保存しました",
    "프로필 저장됨"
  ],
  "Could not save settings in this browser.": [
    "无法在此浏览器中保存设置。",
    "このブラウザーでは設定を保存できませんでした。",
    "이 브라우저에서 설정을 저장할 수 없습니다."
  ],
  "End time must be later than start time.": [
    "结束时间必须晚于开始时间。",
    "終了時刻は開始時刻より後にしてください。",
    "종료 시간은 시작 시간보다 늦어야 합니다."
  ],
  "Add an event title.": [
    "请填写事件标题。",
    "予定のタイトルを入力してください。",
    "일정 제목을 입력하세요."
  ],
  "Add a valid event name and date.": [
    "请输入有效的事件名称和日期。",
    "有効な予定名と日付を入力してください。",
    "유효한 일정 이름과 날짜를 입력하세요."
  ],
  "Describe your event first.": [
    "请先描述事件。",
    "先に予定の内容を入力してください。",
    "먼저 일정 내용을 입력하세요."
  ],
  "Choose a valid event date.": [
    "请选择有效的事件日期。",
    "有効な日付を選択してください。",
    "유효한 날짜를 선택하세요."
  ],
  "Event added": [
    "事件已添加",
    "予定を追加しました",
    "일정 추가됨"
  ],
  "Event updated": [
    "事件已更新",
    "予定を更新しました",
    "일정 업데이트됨"
  ],
  "Event deleted": [
    "事件已删除",
    "予定を削除しました",
    "일정 삭제됨"
  ],
  "Event restored": [
    "事件已恢复",
    "予定を復元しました",
    "일정 복원됨"
  ],
  "Nothing new to import.": [
    "没有新内容可导入。",
    "インポートする新しい項目はありません。",
    "가져올 새 항목이 없습니다."
  ],
  "Your calendar is up to date across devices.": [
    "你的日历已在所有设备间保持同步。",
    "カレンダーはすべてのデバイスで最新です。",
    "캘린더가 모든 기기에서 최신 상태입니다."
  ],
  "You’re offline. Changes are saved here and will sync when you’re back online.": [
    "你当前处于离线状态。更改已保存在此处，联网后会同步。",
    "オフラインです。変更はここに保存され、再接続時に同期されます。",
    "오프라인 상태입니다. 변경 사항은 여기에 저장되며 다시 연결되면 동기화됩니다."
  ],
  "Browser storage is unavailable. Changes may not persist after closing this page.": [
    "浏览器存储不可用。关闭此页面后，更改可能无法保留。",
    "ブラウザーのストレージを利用できません。このページを閉じると変更が失われる可能性があります。",
    "브라우저 저장소를 사용할 수 없습니다. 페이지를 닫으면 변경 사항이 유지되지 않을 수 있습니다."
  ],
  "Authentication could not load. Check your connection, then refresh Calex.": [
    "无法加载身份验证。请检查网络连接后刷新 Calex。",
    "認証を読み込めませんでした。接続を確認して Calex を再読み込みしてください。",
    "인증을 불러올 수 없습니다. 연결을 확인한 후 Calex를 새로고침하세요."
  ],
  "Switch to dark appearance": [
    "切换为深色外观",
    "ダーク表示に切り替え",
    "어두운 화면으로 전환"
  ],
  "Switch to light appearance": [
    "切换为浅色外观",
    "ライト表示に切り替え",
    "밝은 화면으로 전환"
  ],
  "Close assistant": [
    "关闭助手",
    "アシスタントを閉じる",
    "어시스턴트 닫기"
  ],
  "Hide details": [
    "隐藏详情",
    "詳細を非表示",
    "세부 정보 숨기기"
  ],
  "Show details": [
    "显示详情",
    "詳細を表示",
    "세부 정보 표시"
  ],
  "Mark": [
    "标记",
    "マーク",
    "표시"
  ],
  "completed": [
    "已完成",
    "完了",
    "완료"
  ],
  "Edit": [
    "编辑",
    "編集",
    "수정"
  ],
  "until": [
    "直到",
    "まで",
    "까지"
  ],
  "of your day": [
    "你的一天",
    "今日の",
    "하루의"
  ],
  "events today": [
    "今天的事件",
    "今日の予定",
    "오늘의 일정"
  ],
  "ON THE CALENDAR": [
    "日历安排",
    "カレンダー上の予定",
    "캘린더 일정"
  ],
  "TIME COMMITTED": [
    "已安排时间",
    "予定に使う時間",
    "일정에 사용한 시간"
  ],
  "A LITTLE PROGRESS": [
    "一点进展",
    "少しずつ前進",
    "작은 진전"
  ],
  "Manage your account and sign-out options": [
    "管理账户和退出选项",
    "アカウントとサインアウトの設定を管理",
    "계정 및 로그아웃 옵션 관리"
  ],
  "Auto": [
    "自动",
    "自動",
    "자동"
  ],
  "System settings": [
    "系统设置",
    "システム設定",
    "시스템 설정"
  ]
};

  // Bundled translations are deliberately local: no page text is sent to a
  // translation API. Existing rows contain English, Spanish, French, and German.
  const ROWS = [
    ["Skip to calendar", "Saltar al calendario", "Passer au calendrier", "Zum Kalender springen"],
    ["YOUR TIME, WELL SPENT", "TU TIEMPO, BIEN APROVECHADO", "VOTRE TEMPS, BIEN UTILISÉ", "DEINE ZEIT, GUT GENUTZT"],
    ["Your day, at a glance", "Tu día de un vistazo", "Votre journée en un coup d’œil", "Dein Tag auf einen Blick"],
    ["On this device", "En este dispositivo", "Sur cet appareil", "Auf diesem Gerät"],
    ["Ask assistant", "Preguntar al asistente", "Interroger l’assistant", "Assistent fragen"],
    ["New event", "Nuevo evento", "Nouvel événement", "Neuer Termin"],
    ["MAKE ROOM FOR WHAT MATTERS", "HAZ ESPACIO PARA LO IMPORTANTE", "FAITES DE LA PLACE POUR L’ESSENTIEL", "SCHAFF PLATZ FÜR DAS WICHTIGE"],
    ["Monday", "Lunes", "Lundi", "Montag"],
    ["Quick add", "Añadir rápido", "Ajout rapide", "Schnell hinzufügen"],
    ["Today", "Hoy", "Aujourd’hui", "Heute"],
    ["Tomorrow", "Mañana", "Demain", "Morgen"],
    ["Coming up", "Próximamente", "À venir", "Demnächst"],
    ["Mon", "Lun", "Lun", "Mo"],
    ["Tue", "Mar", "Mar", "Di"],
    ["Wed", "Mié", "Mer", "Mi"],
    ["Thu", "Jue", "Jeu", "Do"],
    ["Fri", "Vie", "Ven", "Fr"],
    ["Sat", "Sáb", "Sam", "Sa"],
    ["Sun", "Dom", "Dim", "So"],
    ["Selected day", "Día seleccionado", "Jour sélectionné", "Ausgewählter Tag"],
    ["Quick event", "Evento rápido", "Événement rapide", "Schnelltermin"],
    ["Add event", "Añadir evento", "Ajouter un événement", "Termin hinzufügen"],
    ["LOOKING AHEAD", "MIRANDO HACIA DELANTE", "EN PERSPECTIVE", "AUSBLICK"],
    ["Your next 30 days", "Tus próximos 30 días", "Vos 30 prochains jours", "Deine nächsten 30 Tage"],
    ["A little perspective for everything on your calendar.", "Una visión general de todo lo que tienes en el calendario.", "Un peu de recul sur tout ce qui figure à votre calendrier.", "Ein Überblick über alles in deinem Kalender."],
    ["Back to today", "Volver a hoy", "Revenir à aujourd’hui", "Zurück zu heute"],
    ["Settings", "Ajustes", "Paramètres", "Einstellungen"],
    ["Your Calex account", "Tu cuenta de Calex", "Votre compte Calex", "Dein Calex-Konto"],
    ["Sign in or create an account to securely sync your calendar across devices.", "Inicia sesión o crea una cuenta para sincronizar tu calendario de forma segura entre dispositivos.", "Connectez-vous ou créez un compte pour synchroniser votre calendrier en toute sécurité entre vos appareils.", "Melde dich an oder erstelle ein Konto, um deinen Kalender sicher zwischen Geräten zu synchronisieren."],
    ["Not signed in · using this device", "Sin iniciar sesión · usando este dispositivo", "Non connecté · utilisation de cet appareil", "Nicht angemeldet · dieses Gerät wird verwendet"],
    ["Open live Calex to sign in", "Abre Calex en directo para iniciar sesión", "Ouvrez Calex en ligne pour vous connecter", "Öffne Calex live, um dich anzumelden"],
    ["Continue with Google", "Continuar con Google", "Continuer avec Google", "Mit Google fortfahren"],
    ["Already used Google? Choose Google again. Email/password works only after you have set a password for that account.", "¿Ya usaste Google? Vuelve a elegir Google. El correo y la contraseña solo funcionan después de configurar una contraseña para esa cuenta.", "Vous avez déjà utilisé Google ? Choisissez de nouveau Google. L’adresse e-mail et le mot de passe ne fonctionnent qu’après avoir défini un mot de passe pour ce compte.", "Hast du Google bereits verwendet? Wähle erneut Google. E-Mail und Passwort funktionieren erst, nachdem du ein Passwort für dieses Konto festgelegt hast."],
    ["Email", "Correo electrónico", "E-mail", "E-Mail"],
    ["Password", "Contraseña", "Mot de passe", "Passwort"],
    ["Sign in", "Iniciar sesión", "Se connecter", "Anmelden"],
    ["Create account", "Crear cuenta", "Créer un compte", "Konto erstellen"],
    ["Forgot password?", "¿Olvidaste la contraseña?", "Mot de passe oublié ?", "Passwort vergessen?"],
    ["Resend confirmation email", "Reenviar correo de confirmación", "Renvoyer l’e-mail de confirmation", "Bestätigungs-E-Mail erneut senden"],
    ["Sign out", "Cerrar sesión", "Se déconnecter", "Abmelden"],
    ["Choose a password for your confirmed account.", "Elige una contraseña para tu cuenta confirmada.", "Choisissez un mot de passe pour votre compte confirmé.", "Lege ein Passwort für dein bestätigtes Konto fest."],
    ["New password", "Nueva contraseña", "Nouveau mot de passe", "Neues Passwort"],
    ["Confirm password", "Confirmar contraseña", "Confirmer le mot de passe", "Passwort bestätigen"],
    ["Set password", "Establecer contraseña", "Définir le mot de passe", "Passwort festlegen"],
    ["Your calendar syncs only when you are signed in. You can keep using Calex on this device without an account.", "Tu calendario se sincroniza solo cuando has iniciado sesión. Puedes seguir usando Calex en este dispositivo sin una cuenta.", "Votre calendrier se synchronise uniquement lorsque vous êtes connecté. Vous pouvez continuer à utiliser Calex sur cet appareil sans compte.", "Dein Kalender wird nur synchronisiert, wenn du angemeldet bist. Du kannst Calex auf diesem Gerät auch ohne Konto nutzen."],
    ["CALEX PREFERENCES", "PREFERENCIAS DE CALEX", "PRÉFÉRENCES CALEX", "CALEX-EINSTELLUNGEN"],
    ["Make Calex work the way you do.", "Adapta Calex a tu forma de trabajar.", "Adaptez Calex à votre façon de faire.", "Passe Calex an deine Arbeitsweise an."],
    ["Your profile", "Tu perfil", "Votre profil", "Dein Profil"],
    ["Your name", "Tu nombre", "Votre nom", "Dein Name"],
    ["Add your location", "Añade tu ubicación", "Ajoutez votre emplacement", "Standort hinzufügen"],
    ["Edit profile details", "Editar datos del perfil", "Modifier les détails du profil", "Profildetails bearbeiten"],
    ["Display name", "Nombre visible", "Nom affiché", "Anzeigename"],
    ["Location", "Ubicación", "Emplacement", "Standort"],
    ["City or region", "Ciudad o región", "Ville ou région", "Stadt oder Region"],
    ["These details personalize your calendar on this device.", "Estos datos personalizan tu calendario en este dispositivo.", "Ces informations personnalisent votre calendrier sur cet appareil.", "Diese Angaben personalisieren deinen Kalender auf diesem Gerät."],
    ["Save profile", "Guardar perfil", "Enregistrer le profil", "Profil speichern"],
    ["Account & sync", "Cuenta y sincronización", "Compte et synchronisation", "Konto und Synchronisierung"],
    ["Keep your calendar and preferences available across devices.", "Mantén tu calendario y preferencias disponibles en todos tus dispositivos.", "Retrouvez votre calendrier et vos préférences sur tous vos appareils.", "Halte deinen Kalender und deine Einstellungen auf allen Geräten verfügbar."],
    ["Sign in or create account", "Iniciar sesión o crear una cuenta", "Se connecter ou créer un compte", "Anmelden oder Konto erstellen"],
    ["Securely sync your calendar across devices", "Sincroniza tu calendario de forma segura entre dispositivos", "Synchronisez votre calendrier en toute sécurité entre vos appareils", "Synchronisiere deinen Kalender sicher zwischen Geräten"],
    ["Your events stay on this device until you sign in.", "Tus eventos permanecen en este dispositivo hasta que inicies sesión.", "Vos événements restent sur cet appareil jusqu’à votre connexion.", "Deine Termine bleiben auf diesem Gerät, bis du dich anmeldest."],
    ["Sync now", "Sincronizar ahora", "Synchroniser maintenant", "Jetzt synchronisieren"],
    ["Preferences", "Preferencias", "Préférences", "Einstellungen"],
    ["Time zone", "Zona horaria", "Fuseau horaire", "Zeitzone"],
    ["Automatic · device time zone", "Automática · zona horaria del dispositivo", "Automatique · fuseau horaire de l’appareil", "Automatisch · Gerätezeitzone"],
    ["Automatic", "Automático", "Automatique", "Automatisch"],
    ["Choose time zone", "Elegir zona horaria", "Choisir un fuseau horaire", "Zeitzone auswählen"],
    ["Search by city or region", "Buscar por ciudad o región", "Rechercher par ville ou région", "Nach Stadt oder Region suchen"],
    ["Try London, Tokyo, or UTC…", "Prueba Londres, Tokio o UTC…", "Essayez Londres, Tokyo ou UTC…", "Probiere London, Tokio oder UTC…"],
    ["Matching time zones", "Zonas horarias coincidentes", "Fuseaux horaires correspondants", "Passende Zeitzonen"],
    ["Time zone mode", "Modo de zona horaria", "Mode de fuseau horaire", "Zeitzonenmodus"],
    ["Automatic mode follows the time zone configured on this device.", "El modo automático sigue la zona horaria configurada en este dispositivo.", "Le mode automatique suit le fuseau horaire configuré sur cet appareil.", "Der automatische Modus verwendet die auf diesem Gerät eingestellte Zeitzone."],
    ["Save time zone", "Guardar zona horaria", "Enregistrer le fuseau horaire", "Zeitzone speichern"],
    ["Dark appearance", "Apariencia oscura", "Apparence sombre", "Dunkles Erscheinungsbild"],
    ["Adjust the interface for low-light environments", "Adapta la interfaz a entornos con poca luz", "Adaptez l’interface aux environnements peu éclairés", "Passe die Oberfläche an schwach beleuchtete Umgebungen an"],
    ["Language", "Idioma", "Langue", "Sprache"],
    ["Choose your language", "Elige tu idioma", "Choisissez votre langue", "Wähle deine Sprache"],
    ["Manual", "Manual", "Manuel", "Manuell"],
    ["Using", "Usando", "Utilisation de", "Verwendet"],
    ["on", "activada", "activée", "ein"],
    ["off", "desactivada", "désactivée", "aus"],
    ["What's on the horizon", "Lo que viene", "À l’horizon", "Was steht an"],
    ["Help me plan a balanced day.", "Ayúdame a planificar un día equilibrado.", "Aidez-moi à organiser une journée équilibrée.", "Hilf mir, einen ausgewogenen Tag zu planen."],
    ["Find a 60-minute focus window in my upcoming calendar.", "Encuentra un bloque de 60 minutos de concentración en mi calendario.", "Trouve un créneau de concentration de 60 minutes dans mon calendrier.", "Finde einen 60-minütigen Fokusblock in meinem Kalender."],
    ["Schedule a 30-minute weekly planning session tomorrow at 9am.", "Programa mañana a las 9 una sesión semanal de planificación de 30 minutos.", "Planifie demain à 9 h une séance hebdomadaire de planification de 30 minutes.", "Plane morgen um 9 Uhr eine wöchentliche Planungssitzung von 30 Minuten."],
    ["YOU", "TÚ", "VOUS", "DU"],
    ["event today", "evento hoy", "événement aujourd’hui", "Termin heute"],
    ["Timed", "Con hora", "Avec horaire", "Mit Uhrzeit"],
    ["Repeating", "Recurrente", "Récurrent", "Wiederkehrend"],
    ["Display language", "Idioma de la interfaz", "Langue de l’interface", "Anzeigesprache"],
    ["Your interface language is saved with your preferences.", "El idioma de la interfaz se guarda con tus preferencias.", "La langue de l’interface est enregistrée avec vos préférences.", "Die Anzeigesprache wird zusammen mit deinen Einstellungen gespeichert."],
    ["Your data", "Tus datos", "Vos données", "Deine Daten"],
    ["Export calendar", "Exportar calendario", "Exporter le calendrier", "Kalender exportieren"],
    ["Download a portable .ics calendar file", "Descarga un archivo de calendario .ics portátil", "Télécharger un fichier calendrier .ics portable", "Eine portable .ics-Kalenderdatei herunterladen"],
    ["Import calendar", "Importar calendario", "Importer un calendrier", "Kalender importieren"],
    ["Add events from an .ics file (Google, Outlook, Apple)", "Añade eventos desde un archivo .ics (Google, Outlook, Apple)", "Ajouter des événements depuis un fichier .ics (Google, Outlook, Apple)", "Termine aus einer .ics-Datei hinzufügen (Google, Outlook, Apple)"],
    ["When signed out, your calendar is stored on this device. Signing in enables account-based sync. You can export a copy of your events at any time.", "Cuando cierras sesión, tu calendario se guarda en este dispositivo. Iniciar sesión permite sincronizar con tu cuenta. Puedes exportar una copia de tus eventos cuando quieras.", "Lorsque vous êtes déconnecté, votre calendrier est stocké sur cet appareil. La connexion active la synchronisation du compte. Vous pouvez exporter une copie de vos événements à tout moment.", "Wenn du abgemeldet bist, wird dein Kalender auf diesem Gerät gespeichert. Durch die Anmeldung wird die kontobasierte Synchronisierung aktiviert. Du kannst jederzeit eine Kopie deiner Termine exportieren."],
    ["About & legal", "Acerca de y legal", "À propos et mentions légales", "Info und Rechtliches"],
    ["About Calex", "Über Calex", "À propos de Calex", "Über Calex"],
    ["What Calex does and how to get help", "Qué hace Calex y cómo obtener ayuda", "Ce que fait Calex et comment obtenir de l’aide", "Was Calex macht und wie du Hilfe bekommst"],
    ["Terms of service", "Términos del servicio", "Conditions d’utilisation", "Nutzungsbedingungen"],
    ["Rules and limitations for using Calex", "Reglas y límites para usar Calex", "Règles et limites d’utilisation de Calex", "Regeln und Einschränkungen für die Nutzung von Calex"],
    ["Privacy policy", "Política de privacidad", "Politique de confidentialité", "Datenschutzerklärung"],
    ["How calendar and account data are handled", "Cómo se gestionan los datos del calendario y de la cuenta", "Comment les données du calendrier et du compte sont traitées", "Wie Kalender- und Kontodaten verarbeitet werden"],
    ["ABOUT", "ACERCA DE", "À PROPOS", "ÜBER"],
    ["A calm, straightforward calendar for keeping track of your days.", "Un calendario sencillo y tranquilo para organizar tus días.", "Un calendrier simple et serein pour organiser vos journées.", "Ein ruhiger, unkomplizierter Kalender, um deine Tage im Blick zu behalten."],
    ["What you can do", "Qué puedes hacer", "Ce que vous pouvez faire", "Was du tun kannst"],
    ["Create and manage events, browse dates, search your calendar, set a preferred time zone, and export events as an iCalendar (.ics) file.", "Crea y gestiona eventos, consulta fechas, busca en tu calendario, configura una zona horaria preferida y exporta eventos como archivo iCalendar (.ics).", "Créez et gérez des événements, parcourez les dates, recherchez dans votre calendrier, choisissez un fuseau horaire et exportez des événements au format iCalendar (.ics).", "Erstelle und verwalte Termine, durchsuche Daten, suche im Kalender, lege eine bevorzugte Zeitzone fest und exportiere Termine als iCalendar-Datei (.ics)."],
    ["Your calendar, your choice", "Tu calendario, tu elección", "Votre calendrier, votre choix", "Dein Kalender, deine Wahl"],
    ["You can use Calex on one device without signing in. Signing in enables account-based synchronisation where configured. You can export a copy of your events from Settings.", "Puedes usar Calex en un dispositivo sin iniciar sesión. Cuando está configurada, la sesión permite sincronizar con tu cuenta. Puedes exportar una copia de tus eventos desde Ajustes.", "Vous pouvez utiliser Calex sur un seul appareil sans vous connecter. Lorsque la synchronisation est configurée, la connexion permet la synchronisation du compte. Vous pouvez exporter une copie de vos événements depuis les paramètres.", "Du kannst Calex auf einem Gerät ohne Anmeldung verwenden. Bei entsprechender Konfiguration ermöglicht die Anmeldung die kontobasierte Synchronisierung. Unter Einstellungen kannst du eine Kopie deiner Termine exportieren."],
    ["Help and feedback", "Ayuda y comentarios", "Aide et commentaires", "Hilfe und Feedback"],
    ["Report a bug or request an improvement through the", "Informa de un error o solicita una mejora mediante el", "Signalez un bug ou demandez une amélioration via le", "Melde einen Fehler oder schlage eine Verbesserung vor über den"],
    ["Calex GitHub issue tracker", "seguimiento de incidencias de Calex en GitHub", "suivi des problèmes Calex sur GitHub", "Calex-Issue-Tracker auf GitHub"],
    [". Do not include passwords, private event details, or other sensitive information in a public issue.", ". No incluyas contraseñas, detalles privados de eventos ni otra información sensible en una incidencia pública.", ". N’incluez pas de mots de passe, de détails privés d’événements ni d’autres informations sensibles dans un ticket public.", ". Gib in öffentlichen Issues keine Passwörter, privaten Termindetails oder sonstigen sensiblen Informationen an."],
    ["LEGAL", "LEGAL", "MENTIONS LÉGALES", "RECHTLICHES"],
    ["These terms explain the basic conditions for using Calex. By using the app, you agree to these terms. If you do not agree, stop using the app.", "Estas condiciones explican las reglas básicas para usar Calex. Al utilizar la aplicación, aceptas estas condiciones. Si no estás de acuerdo, deja de usarla.", "Ces conditions expliquent les règles de base d’utilisation de Calex. En utilisant l’application, vous les acceptez. Si vous n’êtes pas d’accord, cessez d’utiliser l’application.", "Diese Bedingungen erläutern die grundlegenden Regeln für die Nutzung von Calex. Mit der Nutzung der App stimmst du ihnen zu. Wenn du nicht zustimmst, nutze die App nicht weiter."],
    ["1. The service", "1. El servicio", "1. Le service", "1. Der Dienst"],
    ["Calex provides calendar and event-management features, including local storage, optional account sign-in and synchronisation, time-zone preferences, and calendar export. Features may change, be unavailable, or be discontinued.", "Calex ofrece funciones de calendario y gestión de eventos, incluido almacenamiento local, inicio de sesión y sincronización opcionales, preferencias de zona horaria y exportación del calendario. Las funciones pueden cambiar, no estar disponibles o dejar de ofrecerse.", "Calex propose des fonctions de calendrier et de gestion d’événements, notamment le stockage local, la connexion et la synchronisation facultatives, les préférences de fuseau horaire et l’exportation du calendrier. Les fonctions peuvent évoluer, être indisponibles ou être supprimées.", "Calex bietet Kalender- und Terminverwaltungsfunktionen, darunter lokale Speicherung, optionale Kontoanmeldung und Synchronisierung, Zeitzoneneinstellungen und Kalenderexport. Funktionen können geändert werden, nicht verfügbar sein oder eingestellt werden."],
    ["2. Your information and responsibilities", "2. Tu información y responsabilidades", "2. Vos informations et responsabilités", "2. Deine Informationen und Pflichten"],
    ["You are responsible for the accuracy of the events you enter and for keeping your account credentials secure. Do not use Calex as the only copy of important information. Export or otherwise back up events you cannot afford to lose.", "Eres responsable de que los eventos introducidos sean correctos y de proteger las credenciales de tu cuenta. No uses Calex como única copia de información importante. Exporta o respalda de otra forma los eventos que no puedes permitirte perder.", "Vous êtes responsable de l’exactitude des événements saisis et de la sécurité de vos identifiants. N’utilisez pas Calex comme unique copie d’informations importantes. Exportez ou sauvegardez autrement les événements que vous ne pouvez pas vous permettre de perdre.", "Du bist für die Richtigkeit deiner Termine und den Schutz deiner Zugangsdaten verantwortlich. Verwende Calex nicht als einzige Kopie wichtiger Informationen. Exportiere oder sichere Termine anderweitig, deren Verlust du dir nicht leisten kannst."],
    ["3. Acceptable use", "3. Uso aceptable", "3. Utilisation acceptable", "3. Zulässige Nutzung"],
    ["Do not misuse the service, attempt to gain unauthorised access, interfere with its operation, or use it in a way that violates applicable law or another person's rights.", "No utilices mal el servicio, no intentes obtener acceso no autorizado, no interfieras con su funcionamiento ni lo uses de una forma que infrinja la ley aplicable o los derechos de otra persona.", "N’utilisez pas le service de manière abusive, ne tentez pas d’obtenir un accès non autorisé, ne perturbez pas son fonctionnement et ne l’utilisez pas d’une manière qui enfreint la loi applicable ou les droits d’autrui.", "Missbrauche den Dienst nicht, versuche nicht, unbefugt Zugriff zu erhalten, störe seinen Betrieb nicht und nutze ihn nicht auf eine Weise, die geltendes Recht oder die Rechte anderer verletzt."],
    ["4. Availability and data loss", "4. Disponibilidad y pérdida de datos", "4. Disponibilité et perte de données", "4. Verfügbarkeit und Datenverlust"],
    ["Calex is provided on an “as available” basis. We do not guarantee uninterrupted service, error-free operation, successful synchronisation, or permanent preservation of data. Device failure, browser settings, clearing site data, account issues, or service outages may affect access to events.", "Calex se proporciona según disponibilidad. No garantizamos un servicio ininterrumpido, un funcionamiento sin errores, una sincronización correcta ni la conservación permanente de los datos. Los fallos del dispositivo, la configuración del navegador, la eliminación de datos del sitio, los problemas de cuenta o las interrupciones del servicio pueden afectar al acceso a los eventos.", "Calex est fourni selon sa disponibilité. Nous ne garantissons ni un service ininterrompu, ni un fonctionnement sans erreur, ni une synchronisation réussie, ni la conservation permanente des données. Une panne de l’appareil, les paramètres du navigateur, l’effacement des données du site, des problèmes de compte ou des interruptions peuvent affecter l’accès aux événements.", "Calex wird nach Verfügbarkeit bereitgestellt. Wir garantieren keinen unterbrechungsfreien Dienst, fehlerfreien Betrieb, erfolgreiche Synchronisierung oder dauerhafte Datenspeicherung. Geräteausfälle, Browsereinstellungen, das Löschen von Websitedaten, Kontoprobleme oder Dienstausfälle können den Zugriff auf Termine beeinträchtigen."],
    ["5. No professional advice or emergency service", "5. Sin asesoramiento profesional ni servicio de emergencias", "5. Aucun conseil professionnel ni service d’urgence", "5. Keine professionelle Beratung oder Notfallhilfe"],
    ["Calex is a general-purpose organisational tool. It is not a medical, legal, financial, or emergency service. You are responsible for checking event details, reminders, dates, and times that matter to you.", "Calex es una herramienta de organización general. No es un servicio médico, jurídico, financiero ni de emergencias. Eres responsable de comprobar los detalles de los eventos, recordatorios, fechas y horas importantes para ti.", "Calex est un outil d’organisation généraliste. Ce n’est pas un service médical, juridique, financier ou d’urgence. Il vous appartient de vérifier les détails des événements, rappels, dates et heures importants pour vous.", "Calex ist ein allgemeines Organisationswerkzeug. Es ist kein medizinischer, rechtlicher, finanzieller oder Notfalldienst. Du bist dafür verantwortlich, wichtige Termindetails, Erinnerungen, Daten und Uhrzeiten zu prüfen."],
    ["6. Limitation of liability", "6. Limitación de responsabilidad", "6. Limitation de responsabilité", "6. Haftungsbeschränkung"],
    ["To the extent permitted by applicable law, Calex is not liable for indirect or consequential loss, missed appointments, or loss of calendar data arising from use of the service. Nothing in these terms excludes rights or liability that cannot lawfully be excluded.", "En la medida permitida por la ley aplicable, Calex no responde por pérdidas indirectas o consecuenciales, citas perdidas ni pérdida de datos del calendario derivadas del uso del servicio. Estas condiciones no excluyen derechos ni responsabilidades que legalmente no puedan excluirse.", "Dans la mesure permise par la loi applicable, Calex n’est pas responsable des pertes indirectes ou consécutives, des rendez-vous manqués ou de la perte de données du calendrier résultant de l’utilisation du service. Rien dans ces conditions n’exclut les droits ou responsabilités qui ne peuvent légalement être exclus.", "Soweit gesetzlich zulässig, haftet Calex nicht für indirekte oder Folgeschäden, verpasste Termine oder Kalenderdatenverluste infolge der Nutzung des Dienstes. Diese Bedingungen schließen keine Rechte oder Haftung aus, die gesetzlich nicht ausgeschlossen werden dürfen."],
    ["7. Changes to these terms", "7. Cambios en estas condiciones", "7. Modifications des conditions", "7. Änderungen dieser Bedingungen"],
    ["These terms may be updated as the app changes. The effective date above indicates the latest published version. Continued use after an update means you accept the revised terms where the law permits.", "Estas condiciones pueden actualizarse a medida que cambie la aplicación. La fecha de entrada en vigor indicada arriba corresponde a la última versión publicada. Si sigues usando la aplicación tras una actualización, aceptas las condiciones revisadas cuando la ley lo permita.", "Ces conditions peuvent être mises à jour à mesure que l’application évolue. La date d’entrée en vigueur ci-dessus indique la dernière version publiée. La poursuite de l’utilisation après une mise à jour vaut acceptation des conditions révisées lorsque la loi le permet.", "Diese Bedingungen können mit der Weiterentwicklung der App aktualisiert werden. Das oben angegebene Datum kennzeichnet die neueste veröffentlichte Version. Wenn du die App nach einer Aktualisierung weiter nutzt, akzeptierst du die überarbeiteten Bedingungen, soweit gesetzlich zulässig."],
    ["8. Contact", "8. Contacto", "8. Contact", "8. Kontakt"],
    ["For support or questions about these terms, use the", "Para obtener ayuda o consultar estas condiciones, utiliza el", "Pour obtenir de l’aide ou poser une question sur ces conditions, utilisez le", "Bei Supportanfragen oder Fragen zu diesen Bedingungen nutze den"],
    [". Do not post confidential information publicly.", ". No publiques información confidencial.", ". Ne publiez pas d’informations confidentielles.", ". Veröffentliche keine vertraulichen Informationen."],
    ["This policy describes how the current Calex app handles information. The precise handling of account data can depend on your sign-in and synchronisation configuration.", "Esta política describe cómo la versión actual de Calex trata la información. El tratamiento exacto de los datos de la cuenta puede depender de tu configuración de inicio de sesión y sincronización.", "Cette politique décrit la manière dont la version actuelle de Calex traite les informations. Le traitement précis des données du compte peut dépendre de votre configuration de connexion et de synchronisation.", "Diese Richtlinie beschreibt, wie die aktuelle Calex-App mit Informationen umgeht. Die genaue Verarbeitung von Kontodaten kann von deinen Einstellungen für Anmeldung und Synchronisierung abhängen."],
    ["1. Information you enter", "1. Información que introduces", "1. Informations que vous saisissez", "1. Angaben, die du eingibst"],
    ["Calendar events may include titles, descriptions, dates, times, locations, attendees or people, repeat settings, and notes. Profile preferences may include a display name, location, time-zone choice, and appearance preference. Avoid entering information you do not want stored in your calendar.", "Los eventos del calendario pueden incluir títulos, descripciones, fechas, horas, ubicaciones, asistentes, opciones de repetición y notas. Las preferencias del perfil pueden incluir nombre visible, ubicación, zona horaria y apariencia. No introduzcas información que no quieras guardar en el calendario.", "Les événements peuvent inclure des titres, descriptions, dates, heures, lieux, participants, paramètres de répétition et notes. Les préférences du profil peuvent inclure un nom affiché, un emplacement, un fuseau horaire et l’apparence. Évitez de saisir des informations que vous ne souhaitez pas stocker dans votre calendrier.", "Kalendertermine können Titel, Beschreibungen, Daten, Uhrzeiten, Orte, Teilnehmende, Wiederholungseinstellungen und Notizen enthalten. Profileinstellungen können Anzeigename, Standort, Zeitzone und Erscheinungsbild umfassen. Gib keine Informationen ein, die nicht in deinem Kalender gespeichert werden sollen."],
    ["2. Local storage", "2. Almacenamiento local", "2. Stockage local", "2. Lokale Speicherung"],
    ["When you use Calex while signed out, events and preferences are saved in your browser's local storage on that device. They are not automatically available on another device. Clearing browser/site data, using private browsing, or losing access to the device may remove locally stored information. Use the export feature to keep a separate copy.", "Cuando usas Calex sin iniciar sesión, los eventos y las preferencias se guardan en el almacenamiento local del navegador de ese dispositivo. No estarán disponibles automáticamente en otro dispositivo. Borrar los datos del navegador o del sitio, usar navegación privada o perder acceso al dispositivo puede eliminar la información guardada. Usa la función de exportación para conservar una copia.", "Lorsque vous utilisez Calex sans être connecté, les événements et préférences sont enregistrés dans le stockage local du navigateur sur cet appareil. Ils ne sont pas automatiquement disponibles sur un autre appareil. L’effacement des données du navigateur ou du site, la navigation privée ou la perte d’accès à l’appareil peut supprimer ces informations. Utilisez l’exportation pour conserver une copie séparée.", "Wenn du Calex abgemeldet verwendest, werden Termine und Einstellungen im lokalen Speicher des Browsers auf diesem Gerät abgelegt. Sie sind nicht automatisch auf anderen Geräten verfügbar. Das Löschen von Browser- oder Websitedaten, privates Surfen oder der Verlust des Gerätezugriffs kann lokal gespeicherte Informationen entfernen. Verwende den Export, um eine separate Kopie aufzubewahren."],
    ["3. Account and synchronisation", "3. Cuenta y sincronización", "3. Compte et synchronisation", "3. Konto und Synchronisierung"],
    ["If you sign in and synchronisation is enabled, Calex uses Supabase authentication and its configured database service to authenticate your account and synchronise calendar events and preferences. This means relevant data may be transmitted to and stored by that service. Account-based data is associated with your account, subject to the app's database access policies and service configuration.", "Si inicias sesión y está habilitada la sincronización, Calex usa la autenticación de Supabase y su base de datos configurada para autenticar tu cuenta y sincronizar eventos y preferencias. Esto significa que los datos pertinentes pueden transmitirse y almacenarse en ese servicio. Los datos de la cuenta se asocian a tu cuenta, sujetos a las políticas de acceso a la base de datos y a la configuración del servicio.", "Si vous vous connectez et que la synchronisation est activée, Calex utilise l’authentification Supabase et son service de base de données configuré pour authentifier votre compte et synchroniser les événements et préférences. Les données concernées peuvent ainsi être transmises à ce service et y être stockées. Les données du compte sont associées à votre compte, selon les règles d’accès à la base de données et la configuration du service.", "Wenn du dich anmeldest und die Synchronisierung aktiviert ist, verwendet Calex die Supabase-Authentifizierung und den konfigurierten Datenbankdienst, um dein Konto zu authentifizieren und Termine sowie Einstellungen zu synchronisieren. Entsprechende Daten können dadurch an diesen Dienst übertragen und dort gespeichert werden. Kontobezogene Daten werden gemäß den Datenbankzugriffsrichtlinien und der Dienstkonfiguration deinem Konto zugeordnet."],
    ["4. Time zone and device information", "4. Zona horaria e información del dispositivo", "4. Fuseau horaire et informations sur l’appareil", "4. Zeitzone und Geräteinformationen"],
    ["Automatic time-zone mode reads the time-zone identifier provided by your browser or device. Calex uses it to display your preference; the app does not need your precise GPS location for this feature. If you enter a location in your profile or an event, that text is stored as part of the relevant data.", "El modo automático lee el identificador de zona horaria que proporciona tu navegador o dispositivo. Calex lo usa para mostrar tu preferencia; esta función no necesita tu ubicación GPS precisa. Si introduces una ubicación en tu perfil o en un evento, ese texto se guarda como parte de los datos correspondientes.", "Le mode automatique lit l’identifiant de fuseau horaire fourni par votre navigateur ou appareil. Calex l’utilise pour afficher votre préférence ; cette fonction n’a pas besoin de votre position GPS précise. Si vous indiquez un lieu dans votre profil ou un événement, ce texte est stocké avec les données concernées.", "Der automatische Zeitzonenmodus liest die von Browser oder Gerät bereitgestellte Zeitzonenkennung. Calex verwendet sie zur Anzeige deiner Einstellung; dafür ist kein genauer GPS-Standort erforderlich. Wenn du einen Standort im Profil oder in einem Termin angibst, wird dieser Text als Teil der entsprechenden Daten gespeichert."],
    ["5. Cookies, analytics, and third parties", "5. Cookies, análisis y terceros", "5. Cookies, analyses et tiers", "5. Cookies, Analysen und Dritte"],
    ["Calex uses browser storage for app data and may load the Supabase client library from a content delivery network. The app's authentication and synchronisation features rely on Supabase when configured. Third-party infrastructure may process technical information under its own terms and policies; consult those policies for details.", "Calex usa el almacenamiento del navegador para los datos de la aplicación y puede cargar la biblioteca cliente de Supabase desde una red de distribución de contenido. Las funciones de autenticación y sincronización dependen de Supabase cuando están configuradas. La infraestructura de terceros puede tratar información técnica conforme a sus propias condiciones y políticas.", "Calex utilise le stockage du navigateur pour les données de l’application et peut charger la bibliothèque cliente Supabase depuis un réseau de diffusion de contenu. Les fonctions d’authentification et de synchronisation reposent sur Supabase lorsqu’elles sont configurées. Des infrastructures tierces peuvent traiter des informations techniques selon leurs propres conditions et politiques.", "Calex nutzt den Browserspeicher für App-Daten und kann die Supabase-Clientbibliothek über ein Content Delivery Network laden. Authentifizierung und Synchronisierung basieren bei entsprechender Konfiguration auf Supabase. Drittanbieter-Infrastruktur kann technische Informationen gemäß ihren eigenen Bedingungen und Richtlinien verarbeiten."],
    ["Optional AI assistant", "Asistente de IA opcional", "Assistant IA facultatif", "Optionaler KI-Assistent"],
    ["The assistant loads Puter.js only when you enable it. Messages you submit are sent to Puter and its AI provider. Calendar context is off by default; turning it on shares upcoming event titles, dates, times, and locations for the next 14 days. Descriptions, notes, and people are not included. Chat history is kept only for this session. Puter authentication, usage allowances, and charges are separate from Calex. Review", "El asistente carga Puter.js solo cuando lo activas. Los mensajes que envías se comparten con Puter y su proveedor de IA. El contexto del calendario está desactivado por defecto; al activarlo, se comparten los títulos, fechas, horas y ubicaciones de los eventos de los próximos 14 días. No se incluyen descripciones, notas ni personas. El historial del chat solo se conserva durante esta sesión. La autenticación, los límites de uso y los cargos de Puter son independientes de Calex. Consulta", "L’assistant ne charge Puter.js que lorsque vous l’activez. Les messages envoyés sont transmis à Puter et à son fournisseur d’IA. Le contexte du calendrier est désactivé par défaut ; son activation partage les titres, dates, heures et lieux des événements des 14 prochains jours. Les descriptions, notes et personnes ne sont pas incluses. L’historique du chat est conservé uniquement pour cette session. L’authentification, les quotas et les frais Puter sont indépendants de Calex. Consultez", "Der Assistent lädt Puter.js erst, wenn du ihn aktivierst. Deine Nachrichten werden an Puter und dessen KI-Anbieter gesendet. Der Kalenderkontext ist standardmäßig deaktiviert; bei Aktivierung werden Titel, Daten, Uhrzeiten und Orte der Termine der nächsten 14 Tage geteilt. Beschreibungen, Notizen und Personen werden nicht einbezogen. Der Chatverlauf bleibt nur für diese Sitzung erhalten. Puter-Authentifizierung, Nutzungslimits und Gebühren sind unabhängig von Calex. Lies"],
    ["Puter's privacy policy", "la política de privacidad de Puter", "la politique de confidentialité de Puter", "die Datenschutzerklärung von Puter"],
    ["before sharing sensitive information. AI suggestions are not saved until you review and confirm them in the event editor.", "antes de compartir información sensible. Las sugerencias de IA no se guardan hasta que las revisas y confirmas en el editor de eventos.", "avant de partager des informations sensibles. Les suggestions de l’IA ne sont pas enregistrées tant que vous ne les avez pas examinées et confirmées dans l’éditeur d’événements.", "bevor du sensible Informationen teilst. KI-Vorschläge werden erst gespeichert, wenn du sie im Termin-Editor prüfst und bestätigst."],
    ["6. Sharing and disclosure", "6. Compartición y divulgación", "6. Partage et divulgation", "6. Weitergabe und Offenlegung"],
    ["Calex does not provide a public calendar-sharing feature in the current interface. Data may be processed by the infrastructure providers required to operate sign-in and synchronisation, or disclosed where required by law. Anyone with access to your unlocked device or account may be able to access your calendar.", "La interfaz actual de Calex no ofrece una función para compartir calendarios públicamente. Los datos pueden ser tratados por los proveedores necesarios para el inicio de sesión y la sincronización, o divulgarse cuando lo exija la ley. Quien tenga acceso a tu dispositivo desbloqueado o a tu cuenta podría acceder al calendario.", "L’interface actuelle de Calex ne propose pas de partage public du calendrier. Les données peuvent être traitées par les fournisseurs nécessaires à la connexion et à la synchronisation, ou divulguées si la loi l’exige. Toute personne ayant accès à votre appareil déverrouillé ou à votre compte peut potentiellement accéder à votre calendrier.", "Die aktuelle Calex-Oberfläche bietet keine öffentliche Kalenderfreigabe. Daten können von den für Anmeldung und Synchronisierung benötigten Infrastrukturanbietern verarbeitet oder gesetzlich erforderlichenfalls offengelegt werden. Wer Zugriff auf dein entsperrtes Gerät oder Konto hat, kann möglicherweise auch deinen Kalender einsehen."],
    ["7. Retention and deletion", "7. Conservación y eliminación", "7. Conservation et suppression", "7. Aufbewahrung und Löschung"],
    ["Local data remains in your browser until you remove it or the browser clears it. Signed-in data may remain in the configured cloud database until deleted through supported app or account-management processes or by the service operator. Export your events before clearing local data or changing accounts. If you need account data deleted, contact the app maintainer through the link below; do not include private event details in a public request.", "Los datos locales permanecen en el navegador hasta que los elimines o el navegador los borre. Los datos de una cuenta pueden permanecer en la base de datos en la nube hasta que se eliminen mediante las funciones disponibles, la gestión de cuenta o el operador del servicio. Exporta tus eventos antes de borrar datos locales o cambiar de cuenta. Para solicitar la eliminación de datos de cuenta, contacta con el responsable de la aplicación mediante el enlace inferior; no incluyas detalles privados en una solicitud pública.", "Les données locales restent dans votre navigateur jusqu’à leur suppression par vous ou par le navigateur. Les données liées à un compte peuvent rester dans la base cloud configurée jusqu’à leur suppression via les fonctions prises en charge, la gestion du compte ou l’opérateur du service. Exportez vos événements avant d’effacer les données locales ou de changer de compte. Pour demander la suppression des données de compte, contactez le responsable via le lien ci-dessous sans inclure de détails privés dans une demande publique.", "Lokale Daten bleiben im Browser, bis du sie entfernst oder der Browser sie löscht. Angemeldete Daten können in der konfigurierten Cloud-Datenbank verbleiben, bis sie über unterstützte App-Funktionen, die Kontoverwaltung oder den Dienstbetreiber gelöscht werden. Exportiere Termine, bevor du lokale Daten löschst oder das Konto wechselst. Wende dich zur Löschung von Kontodaten über den Link unten an den App-Betreiber; gib in einer öffentlichen Anfrage keine privaten Termindetails an."],
    ["8. Your choices and security", "8. Tus opciones y seguridad", "8. Vos choix et votre sécurité", "8. Deine Möglichkeiten und Sicherheit"],
    ["You can use Calex without signing in, choose whether to enable account synchronisation, export your calendar, and avoid entering unnecessary personal information. No online service can guarantee absolute security, so use a strong unique password and protect access to your device.", "Puedes usar Calex sin iniciar sesión, decidir si activas la sincronización de cuenta, exportar tu calendario y evitar introducir datos personales innecesarios. Ningún servicio en línea puede garantizar una seguridad absoluta; utiliza una contraseña única y robusta y protege el acceso a tu dispositivo.", "Vous pouvez utiliser Calex sans vous connecter, choisir d’activer ou non la synchronisation du compte, exporter votre calendrier et éviter de saisir des données personnelles inutiles. Aucun service en ligne ne peut garantir une sécurité absolue : utilisez un mot de passe unique et robuste et protégez l’accès à votre appareil.", "Du kannst Calex ohne Anmeldung nutzen, die Kontosynchronisierung aktivieren oder deaktivieren, deinen Kalender exportieren und unnötige persönliche Angaben vermeiden. Kein Online-Dienst kann absolute Sicherheit garantieren. Verwende ein starkes, einzigartiges Passwort und schütze den Zugriff auf dein Gerät."],
    ["9. Children and sensitive information", "9. Menores e información sensible", "9. Enfants et informations sensibles", "9. Kinder und sensible Informationen"],
    ["Do not use Calex to store highly sensitive information unless you have assessed that it is appropriate for your circumstances and the service configuration. If you are using Calex under a parent's or organisation's guidance, follow their applicable rules.", "No uses Calex para guardar información muy sensible salvo que hayas evaluado que es adecuado para tus circunstancias y la configuración del servicio. Si utilizas Calex bajo la orientación de un progenitor o una organización, sigue las normas correspondientes.", "N’utilisez pas Calex pour stocker des informations très sensibles sans avoir évalué si cela convient à votre situation et à la configuration du service. Si vous utilisez Calex sous la supervision d’un parent ou d’une organisation, respectez leurs règles applicables.", "Speichere keine hochsensiblen Informationen in Calex, es sei denn, du hast geprüft, ob dies zu deinen Umständen und der Dienstkonfiguration passt. Wenn du Calex unter Anleitung eines Elternteils oder einer Organisation verwendest, befolge deren geltende Regeln."],
    ["10. Policy changes and contact", "10. Cambios en la política y contacto", "10. Modifications de la politique et contact", "10. Änderungen der Richtlinie und Kontakt"],
    ["This policy may change as Calex evolves. For privacy questions or deletion requests, contact the maintainer through the", "Esta política puede cambiar a medida que evolucione Calex. Para dudas sobre privacidad o solicitudes de eliminación, contacta con el responsable mediante el", "Cette politique peut évoluer avec Calex. Pour toute question relative à la confidentialité ou demande de suppression, contactez le responsable via le", "Diese Richtlinie kann sich mit Calex weiterentwickeln. Bei Datenschutzfragen oder Löschanfragen kontaktiere die verantwortliche Person über den"],
    [". Public issues are visible to others, so request a private contact route before sharing personal data.", ". Las incidencias públicas son visibles para otras personas; solicita un canal de contacto privado antes de compartir datos personales.", ". Les tickets publics sont visibles par d’autres personnes ; demandez un moyen de contact privé avant de partager des données personnelles.", ". Öffentliche Issues sind für andere sichtbar. Bitte um einen privaten Kontaktweg, bevor du personenbezogene Daten weitergibst."],
    ["WORKSPACE", "ESPACIO DE TRABAJO", "ESPACE DE TRAVAIL", "ARBEITSBEREICH"],
    ["Overview", "Resumen", "Vue d’ensemble", "Übersicht"],
    ["Calendar", "Calendario", "Calendrier", "Kalender"],
    ["Agenda", "Agenda", "Agenda", "Agenda"],
    ["MY CALENDARS", "MIS CALENDARIOS", "MES CALENDRIERS", "MEINE KALENDER"],
    ["Personal", "Personal", "Personnel", "Persönlich"],
    ["Work & study", "Trabajo y estudio", "Travail et études", "Arbeit und Studium"],
    ["Wellbeing", "Bienestar", "Bien-être", "Wohlbefinden"],
    ["A little help planning", "Un poco de ayuda para planificar", "Un peu d’aide pour planifier", "Etwas Planungshilfe"],
    ["Meet your Calex assistant", "Conoce al asistente de Calex", "Découvrez l’assistant Calex", "Lerne den Calex-Assistenten kennen"],
    ["Install Calex", "Instalar Calex", "Installer Calex", "Calex installieren"],
    ["Made for your everyday", "Hecho para tu día a día", "Pensé pour votre quotidien", "Für deinen Alltag gemacht"],
    ["Saved on this device", "Guardado en este dispositivo", "Enregistré sur cet appareil", "Auf diesem Gerät gespeichert"],
    ["Describe your event", "Describe tu evento", "Décrivez votre événement", "Beschreibe deinen Termin"],
    ["Try “Team meeting tomorrow 10:07 to 20:00”, “Gym every Monday at 6pm”, or “Lunch on 14 June at noon”. We’ll interpret common dates, times and repeats.", "Prueba «Reunión de equipo mañana de 10:07 a 20:00», «Gimnasio cada lunes a las 18:00» o «Comida el 14 de junio al mediodía». Interpretaremos fechas, horas y repeticiones habituales.", "Essayez « Réunion d’équipe demain de 10:07 à 20:00 », « Sport chaque lundi à 18 h » ou « Déjeuner le 14 juin à midi ». Nous interprétons les dates, heures et répétitions courantes.", "Probiere „Teammeeting morgen 10:07 bis 20:00“, „Fitness jeden Montag um 18 Uhr“ oder „Mittagessen am 14. Juni um 12 Uhr“. Häufige Datums-, Zeit- und Wiederholungsangaben werden erkannt."],
    ["Start typing to see the preview...", "Empieza a escribir para ver la vista previa...", "Commencez à écrire pour voir l’aperçu...", "Beginne zu tippen, um eine Vorschau zu sehen …"],
    ["Date *", "Fecha *", "Date *", "Datum *"],
    ["Start time", "Hora de inicio", "Heure de début", "Startzeit"],
    ["End time", "Hora de finalización", "Heure de fin", "Endzeit"],
    ["Repeat", "Repetir", "Répéter", "Wiederholen"],
    ["Never", "Nunca", "Jamais", "Nie"],
    ["Every day", "Todos los días", "Tous les jours", "Jeden Tag"],
    ["Every week", "Todas las semanas", "Chaque semaine", "Jede Woche"],
    ["Every fortnight", "Cada dos semanas", "Toutes les deux semaines", "Alle zwei Wochen"],
    ["Every month", "Cada mes", "Chaque mois", "Jeden Monat"],
    ["Every year", "Cada año", "Chaque année", "Jedes Jahr"],
    ["People", "Personas", "Personnes", "Personen"],
    ["Notes", "Notas", "Notes", "Notizen"],
    ["Save event", "Guardar evento", "Enregistrer l’événement", "Termin speichern"],
    ["A LITTLE CLARITY", "UN POCO DE CLARIDAD", "UN PEU DE CLARTÉ", "EIN WENIG KLARHEIT"],
    ["Calex assistant", "Asistente de Calex", "Assistant Calex", "Calex-Assistent"],
    ["Less juggling.", "Menos malabares.", "Moins de choses à jongler.", "Weniger Jonglieren."],
    ["More breathing room.", "Más espacio para respirar.", "Plus d’espace pour respirer.", "Mehr Luft zum Durchatmen."],
    ["Plan your day, find a focus window, or turn an idea into an event.", "Planifica tu día, encuentra un momento para concentrarte o convierte una idea en un evento.", "Planifiez votre journée, trouvez un créneau de concentration ou transformez une idée en événement.", "Plane deinen Tag, finde Zeit für konzentriertes Arbeiten oder mache aus einer Idee einen Termin."],
    ["Powered by Puter. Your own account handles AI access and any usage costs. Only messages you send are shared unless you enable calendar context.", "Funciona con Puter. Tu cuenta gestiona el acceso a la IA y los posibles costes de uso. Solo se comparten los mensajes que envías, salvo que actives el contexto del calendario.", "Propulsé par Puter. Votre compte gère l’accès à l’IA et les éventuels frais d’utilisation. Seuls les messages que vous envoyez sont partagés, sauf si vous activez le contexte du calendrier.", "Betrieben mit Puter. Dein eigenes Konto verwaltet den KI-Zugriff und mögliche Nutzungskosten. Nur deine gesendeten Nachrichten werden geteilt, sofern du den Kalenderkontext nicht aktivierst."],
    ["Enable Puter assistant", "Activar el asistente de Puter", "Activer l’assistant Puter", "Puter-Assistent aktivieren"],
    ["Plan my day", "Planificar mi día", "Planifier ma journée", "Meinen Tag planen"],
    ["Find focus time", "Encontrar tiempo de concentración", "Trouver du temps de concentration", "Konzentrationszeit finden"],
    ["Create an event", "Crear un evento", "Créer un événement", "Termin erstellen"],
    ["Share next 14 days (titles, times, locations)", "Compartir los próximos 14 días (títulos, horas y ubicaciones)", "Partager les 14 prochains jours (titres, heures et lieux)", "Nächste 14 Tage teilen (Titel, Zeiten, Orte)"],
    ["Message the assistant", "Escribe al asistente", "Envoyer un message à l’assistant", "Nachricht an den Assistenten"],
    ["AI can make mistakes. Review dates and times before saving.", "La IA puede cometer errores. Revisa las fechas y horas antes de guardar.", "L’IA peut se tromper. Vérifiez les dates et heures avant d’enregistrer.", "KI kann Fehler machen. Prüfe Daten und Uhrzeiten vor dem Speichern."],
    ["Make time for shortcuts", "Haz tiempo para los atajos", "Gagnez du temps avec les raccourcis", "Zeit sparen mit Tastenkürzeln"],
    ["Search calendar", "Buscar en el calendario", "Rechercher dans le calendrier", "Kalender durchsuchen"],
    ["Go to today", "Ir a hoy", "Aller à aujourd’hui", "Zu heute wechseln"],
    ["Month / week / year", "Mes / semana / año", "Mois / semaine / année", "Monat / Woche / Jahr"],
    ["Close dialog", "Cerrar cuadro de diálogo", "Fermer la boîte de dialogue", "Dialog schließen"],
    ["My calendars", "Mis calendarios", "Mes calendriers", "Meine Kalender"],
    ["Quick event", "Evento rápido", "Événement rapide", "Schnelltermin"],
    ["Full dates", "Fechas completas", "Toutes les dates", "Alle Daten"],
    ["Month", "Mes", "Mois", "Monat"],
    ["Week", "Semana", "Semaine", "Woche"],
    ["View", "Vista", "Vue", "Ansicht"],
    ["view", "vista", "vue", "Ansicht"],
    ["Events", "Eventos", "Événements", "Termine"],
    ["event", "evento", "événement", "Termin"],
    ["events", "eventos", "événements", "Termine"],
    ["To do", "Pendiente", "À faire", "Zu erledigen"],
    ["Completed", "Completado", "Terminé", "Erledigt"],
    ["Nothing planned for this day.", "Nada previsto para este día.", "Rien de prévu pour cette journée.", "Für diesen Tag ist nichts geplant."],
    ["Completed events will appear here.", "Los eventos completados aparecerán aquí.", "Les événements terminés apparaîtront ici.", "Abgeschlossene Termine erscheinen hier."],
    ["No events planned for this day.", "No hay eventos previstos para este día.", "Aucun événement prévu pour cette journée.", "Für diesen Tag sind keine Termine geplant."],
    ["All day", "Todo el día", "Toute la journée", "Ganztägig"],
    ["Until", "Hasta", "Jusqu’à", "Bis"],
    ["With", "Con", "Avec", "Mit"],
    ["Repeat daily", "Repetir a diario", "Répéter chaque jour", "Täglich wiederholen"],
    ["Repeats daily", "Se repite a diario", "Répétition quotidienne", "Wiederholt sich täglich"],
    ["Repeats weekly", "Se repite cada semana", "Répétition hebdomadaire", "Wiederholt sich wöchentlich"],
    ["Repeats monthly", "Se repite cada mes", "Répétition mensuelle", "Wiederholt sich monatlich"],
    ["Repeats yearly", "Se repite cada año", "Répétition annuelle", "Wiederholt sich jährlich"],
    ["Delete event", "Eliminar evento", "Supprimer l’événement", "Termin löschen"],
    ["Edit event", "Editar evento", "Modifier l’événement", "Termin bearbeiten"],
    ["No matching events or dates.", "No hay eventos ni fechas coincidentes.", "Aucun événement ou date correspondant.", "Keine passenden Termine oder Daten."],
    ["No matching time zones. Try a city or region name.", "No se encontraron zonas horarias. Prueba con una ciudad o región.", "Aucun fuseau horaire correspondant. Essayez une ville ou une région.", "Keine passende Zeitzone gefunden. Versuche einen Stadt- oder Regionsnamen."],
    ["Choose a time zone from the search results.", "Elige una zona horaria de los resultados de búsqueda.", "Choisissez un fuseau horaire dans les résultats.", "Wähle eine Zeitzone aus den Suchergebnissen."],
    ["Time zone preference saved", "Preferencia de zona horaria guardada", "Préférence de fuseau horaire enregistrée", "Zeitzoneneinstellung gespeichert"],
    ["Profile saved", "Perfil guardado", "Profil enregistré", "Profil gespeichert"],
    ["Could not save settings in this browser.", "No se pudieron guardar los ajustes en este navegador.", "Impossible d’enregistrer les paramètres dans ce navigateur.", "Einstellungen konnten in diesem Browser nicht gespeichert werden."],
    ["Appearance changed for this session, but could not be saved.", "La apariencia cambió durante esta sesión, pero no se pudo guardar.", "L’apparence a changé pour cette session, mais n’a pas pu être enregistrée.", "Das Erscheinungsbild wurde für diese Sitzung geändert, konnte aber nicht gespeichert werden."],
    ["End time must be later than start time.", "La hora de finalización debe ser posterior a la hora de inicio.", "L’heure de fin doit être postérieure à l’heure de début.", "Die Endzeit muss nach der Startzeit liegen."],
    ["Add an event title.", "Añade un título al evento.", "Ajoutez un titre à l’événement.", "Gib einen Termintitel ein."],
    ["Add a valid event name and date.", "Añade un nombre de evento y una fecha válidos.", "Ajoutez un nom d’événement et une date valides.", "Gib einen gültigen Terminnamen und ein Datum ein."],
    ["Describe your event first.", "Describe primero tu evento.", "Décrivez d’abord votre événement.", "Beschreibe zuerst deinen Termin."],
    ["Choose a valid event date.", "Elige una fecha de evento válida.", "Choisissez une date d’événement valide.", "Wähle ein gültiges Termindatum."],
    ["Event added", "Evento añadido", "Événement ajouté", "Termin hinzugefügt"],
    ["Event updated", "Evento actualizado", "Événement mis à jour", "Termin aktualisiert"],
    ["Event deleted", "Evento eliminado", "Événement supprimé", "Termin gelöscht"],
    ["Event restored", "Evento restaurado", "Événement restauré", "Termin wiederhergestellt"],
    ["No events found in that file.", "No se encontraron eventos en ese archivo.", "Aucun événement trouvé dans ce fichier.", "In dieser Datei wurden keine Termine gefunden."],
    ["Nothing new to import.", "No hay nada nuevo que importar.", "Aucun nouvel élément à importer.", "Nichts Neues zum Importieren."],
    ["Couldn’t read that file. Is it a valid .ics calendar?", "No se pudo leer el archivo. ¿Es un calendario .ics válido?", "Impossible de lire ce fichier. S’agit-il d’un calendrier .ics valide ?", "Die Datei konnte nicht gelesen werden. Ist es ein gültiger .ics-Kalender?"],
    ["Couldn’t sync. Your changes are saved on this device.", "No se pudo sincronizar. Tus cambios están guardados en este dispositivo.", "Synchronisation impossible. Vos modifications sont enregistrées sur cet appareil.", "Synchronisierung fehlgeschlagen. Deine Änderungen sind auf diesem Gerät gespeichert."],
    ["Couldn’t sync just now. Your changes are safe on this device. Tap Sync now to retry.", "No se pudo sincronizar ahora. Tus cambios están a salvo en este dispositivo. Pulsa Sincronizar ahora para volver a intentarlo.", "Synchronisation momentanément impossible. Vos modifications restent sur cet appareil. Appuyez sur Synchroniser maintenant pour réessayer.", "Synchronisierung gerade nicht möglich. Deine Änderungen sind auf diesem Gerät sicher. Tippe auf „Jetzt synchronisieren“, um es erneut zu versuchen."],
    ["Your calendar is up to date across devices.", "Tu calendario está actualizado en todos tus dispositivos.", "Votre calendrier est à jour sur tous vos appareils.", "Dein Kalender ist auf allen Geräten aktuell."],
    ["You’re offline. Changes are saved here and will sync when you’re back online.", "Estás sin conexión. Los cambios se guardan aquí y se sincronizarán cuando vuelvas a conectarte.", "Vous êtes hors ligne. Les modifications sont enregistrées ici et seront synchronisées à votre reconnexion.", "Du bist offline. Änderungen werden hier gespeichert und bei erneuter Verbindung synchronisiert."],
    ["Browser storage is unavailable. Changes may not persist after closing this page.", "El almacenamiento del navegador no está disponible. Los cambios podrían perderse al cerrar esta página.", "Le stockage du navigateur est indisponible. Les modifications risquent de ne pas être conservées après la fermeture de cette page.", "Der Browserspeicher ist nicht verfügbar. Änderungen bleiben nach dem Schließen dieser Seite möglicherweise nicht erhalten."],
    ["Browser storage is unavailable. Events last only for this session. Export a backup from Settings.", "El almacenamiento del navegador no está disponible. Los eventos solo durarán esta sesión. Exporta una copia de seguridad desde Ajustes.", "Le stockage du navigateur est indisponible. Les événements ne durent que pendant cette session. Exportez une sauvegarde depuis les paramètres.", "Der Browserspeicher ist nicht verfügbar. Termine bleiben nur für diese Sitzung erhalten. Exportiere eine Sicherung über Einstellungen."],
    ["Events · chronological", "Eventos · cronológico", "Événements · chronologique", "Termine · chronologisch"],
    ["Make yourself at home", "Ponte a gusto", "Faites comme chez vous", "Mach es dir bequem"],
    ["A little space for everything", "Un pequeño espacio para todo", "Un espace pour chaque chose", "Ein wenig Platz für alles"],
    ["Your privacy matters", "Tu privacidad importa", "Votre confidentialité compte", "Deine Privatsphäre ist wichtig"],
    ["Terms of service", "Términos del servicio", "Conditions d’utilisation", "Nutzungsbedingungen"],
    ["Authentication could not load. Check your connection, then refresh Calex.", "No se pudo cargar la autenticación. Comprueba la conexión y actualiza Calex.", "Impossible de charger l’authentification. Vérifiez votre connexion puis actualisez Calex.", "Authentifizierung konnte nicht geladen werden. Prüfe deine Verbindung und lade Calex neu."],
    ["Authentication library is unavailable. Refresh and try again.", "La biblioteca de autenticación no está disponible. Actualiza e inténtalo de nuevo.", "La bibliothèque d’authentification est indisponible. Actualisez puis réessayez.", "Die Authentifizierungsbibliothek ist nicht verfügbar. Lade die Seite neu und versuche es erneut."],
    ["Could not load authentication. Refresh and try again.", "No se pudo cargar la autenticación. Actualiza e inténtalo de nuevo.", "Impossible de charger l’authentification. Actualisez puis réessayez.", "Authentifizierung konnte nicht geladen werden. Lade die Seite neu und versuche es erneut."],
    ["Could not contact authentication. Check your connection and try again.", "No se pudo contactar con la autenticación. Comprueba tu conexión e inténtalo de nuevo.", "Impossible de contacter le service d’authentification. Vérifiez votre connexion et réessayez.", "Authentifizierungsdienst nicht erreichbar. Prüfe deine Verbindung und versuche es erneut."],
    ["Could not request a confirmation email.", "No se pudo solicitar el correo de confirmación.", "Impossible de demander l’e-mail de confirmation.", "Bestätigungs-E-Mail konnte nicht angefordert werden."],
    ["Could not request a reset. Please try again.", "No se pudo solicitar el restablecimiento. Inténtalo de nuevo.", "Impossible de demander la réinitialisation. Veuillez réessayer.", "Zurücksetzen konnte nicht angefordert werden. Bitte versuche es erneut."],
    ["Could not restore your sign-in session. Please try again.", "No se pudo restaurar tu sesión. Inténtalo de nuevo.", "Impossible de restaurer votre session. Veuillez réessayer.", "Deine Anmeldesitzung konnte nicht wiederhergestellt werden. Bitte versuche es erneut."],
    ["Could not set a password.", "No se pudo establecer la contraseña.", "Impossible de définir le mot de passe.", "Passwort konnte nicht festgelegt werden."],
    ["Authentication could not complete. Check your connection and try again.", "No se pudo completar la autenticación. Comprueba tu conexión e inténtalo de nuevo.", "L’authentification n’a pas abouti. Vérifiez votre connexion et réessayez.", "Authentifizierung konnte nicht abgeschlossen werden. Prüfe deine Verbindung und versuche es erneut."],
    ["Add a valid event name and date.", "Añade un nombre de evento y una fecha válidos.", "Ajoutez un nom d’événement et une date valides.", "Gib einen gültigen Terminnamen und ein Datum ein."],
    ["Enter your email first.", "Introduce primero tu correo electrónico.", "Saisissez d’abord votre adresse e-mail.", "Gib zuerst deine E-Mail-Adresse ein."],
    ["Enter a valid email address before requesting a confirmation.", "Introduce una dirección de correo válida antes de solicitar la confirmación.", "Saisissez une adresse e-mail valide avant de demander une confirmation.", "Gib eine gültige E-Mail-Adresse ein, bevor du eine Bestätigung anforderst."],
    ["Enter a valid email and password of at least 6 characters.", "Introduce un correo válido y una contraseña de al menos 6 caracteres.", "Saisissez une adresse e-mail valide et un mot de passe d’au moins 6 caractères.", "Gib eine gültige E-Mail-Adresse und ein Passwort mit mindestens 6 Zeichen ein."],
    ["Google sign-in could not start.", "No se pudo iniciar el acceso con Google.", "La connexion Google n’a pas pu démarrer.", "Die Google-Anmeldung konnte nicht gestartet werden."],
    ["Google sign-in must run outside this embedded preview. Open the live Calex site using the link below, then choose Continue with Google.", "El inicio de sesión con Google debe realizarse fuera de esta vista previa integrada. Abre Calex en directo con el enlace siguiente y elige Continuar con Google.", "La connexion Google doit être effectuée en dehors de cet aperçu intégré. Ouvrez Calex en ligne via le lien ci-dessous, puis choisissez Continuer avec Google.", "Die Google-Anmeldung muss außerhalb dieser eingebetteten Vorschau erfolgen. Öffne Calex über den Link unten und wähle dann „Mit Google fortfahren“."],
    ["Could not load authentication. Refresh and try again.", "No se pudo cargar la autenticación. Actualiza e inténtalo de nuevo.", "Impossible de charger l’authentification. Actualisez puis réessayez.", "Authentifizierung konnte nicht geladen werden. Lade die Seite neu und versuche es erneut."],
    ["Authentication library is unavailable. Refresh and try again.", "La biblioteca de autenticación no está disponible. Actualiza e inténtalo de nuevo.", "La bibliothèque d’authentification est indisponible. Actualisez puis réessayez.", "Die Authentifizierungsbibliothek ist nicht verfügbar. Lade die Seite neu und versuche es erneut."],
    ["Passwords do not match.", "Las contraseñas no coinciden.", "Les mots de passe ne correspondent pas.", "Die Passwörter stimmen nicht überein."],
    ["Your email is not confirmed yet. Check your inbox and spam folder, or request a new confirmation below.", "Tu correo electrónico aún no está confirmado. Revisa la bandeja de entrada y el correo no deseado, o solicita una nueva confirmación abajo.", "Votre adresse e-mail n’est pas encore confirmée. Vérifiez votre boîte de réception et les courriers indésirables, ou demandez une nouvelle confirmation ci-dessous.", "Deine E-Mail-Adresse ist noch nicht bestätigt. Prüfe Posteingang und Spam-Ordner oder fordere unten eine neue Bestätigung an."],
    ["Password reset requested. If an account exists for this email, check your inbox and spam folder.", "Se solicitó restablecer la contraseña. Si existe una cuenta con este correo, revisa la bandeja de entrada y el correo no deseado.", "La réinitialisation du mot de passe a été demandée. Si un compte existe pour cette adresse, vérifiez votre boîte de réception et les courriers indésirables.", "Das Zurücksetzen des Passworts wurde angefordert. Falls ein Konto für diese E-Mail-Adresse besteht, prüfe Posteingang und Spam-Ordner."],
    ["Password set. You can now use email/password or Google for this account.", "Contraseña configurada. Ahora puedes usar el correo y la contraseña o Google para esta cuenta.", "Mot de passe défini. Vous pouvez maintenant utiliser l’e-mail et le mot de passe ou Google pour ce compte.", "Passwort festgelegt. Du kannst dich bei diesem Konto jetzt mit E-Mail/Passwort oder Google anmelden."],
    ["Signed in. Your calendar is connected.", "Has iniciado sesión. Tu calendario está conectado.", "Vous êtes connecté. Votre calendrier est relié.", "Du bist angemeldet. Dein Kalender ist verbunden."],
    ["Signed out", "Sesión cerrada", "Déconnecté", "Abgemeldet"],
    ["Sign-in request completed", "Solicitud de inicio de sesión completada", "Demande de connexion terminée", "Anmeldeanforderung abgeschlossen"],
    ["Account created", "Cuenta creada", "Compte créé", "Konto erstellt"],
    ["Account connected", "Cuenta conectada", "Compte connecté", "Konto verbunden"],
    ["Account sync enabled", "Sincronización de cuenta activada", "Synchronisation du compte activée", "Kontosynchronisierung aktiviert"],
    ["Sync needs attention", "La sincronización requiere atención", "La synchronisation nécessite votre attention", "Synchronisierung erfordert Aufmerksamkeit"],
    ["Offline · saved locally", "Sin conexión · guardado localmente", "Hors ligne · enregistré localement", "Offline · lokal gespeichert"],
    ["Offline, still organised", "Sin conexión, pero organizado", "Hors ligne, toujours organisé", "Offline, weiterhin organisiert"],
    ["Saved on this device", "Guardado en este dispositivo", "Enregistré sur cet appareil", "Auf diesem Gerät gespeichert"],
    ["Storage unavailable · export a backup", "Almacenamiento no disponible · exporta una copia", "Stockage indisponible · exportez une sauvegarde", "Speicher nicht verfügbar · Sicherung exportieren"],
    ["Loading Puter…", "Cargando Puter…", "Chargement de Puter…", "Puter wird geladen …"],
    ["Sign in to Puter", "Iniciar sesión en Puter", "Se connecter à Puter", "Bei Puter anmelden"],
    ["Ready. Click Sign in to open Puter's account window.", "Listo. Haz clic en Iniciar sesión para abrir la ventana de cuenta de Puter.", "Prêt. Cliquez sur Se connecter pour ouvrir la fenêtre du compte Puter.", "Bereit. Klicke auf „Anmelden“, um das Puter-Kontofenster zu öffnen."],
    ["Sign-in did not finish. Please try again.", "El inicio de sesión no se completó. Inténtalo de nuevo.", "La connexion n’a pas abouti. Veuillez réessayer.", "Die Anmeldung wurde nicht abgeschlossen. Bitte versuche es erneut."],
    ["The assistant needs an internet connection. Your calendar still works offline.", "El asistente necesita conexión a Internet. Tu calendario sigue funcionando sin conexión.", "L’assistant nécessite une connexion Internet. Votre calendrier reste utilisable hors ligne.", "Der Assistent benötigt eine Internetverbindung. Dein Kalender funktioniert weiterhin offline."],
    ["Enable the assistant and sign in to Puter first.", "Activa el asistente e inicia sesión en Puter primero.", "Activez d’abord l’assistant et connectez-vous à Puter.", "Aktiviere zuerst den Assistenten und melde dich bei Puter an."],
    ["You're offline. Reconnect to use the assistant.", "No tienes conexión. Vuelve a conectarte para usar el asistente.", "Vous êtes hors ligne. Reconnectez-vous pour utiliser l’assistant.", "Du bist offline. Stelle die Verbindung wieder her, um den Assistenten zu nutzen."],
    ["Making a little room for thought…", "Haciendo un poco de espacio para pensar…", "Un peu d’espace pour réfléchir…", "Ein wenig Raum zum Nachdenken …"],
    ["Please try rephrasing that.", "Intenta expresarlo de otra manera.", "Essayez de reformuler.", "Versuche, es anders zu formulieren."],
    ["Review event", "Revisar evento", "Vérifier l’événement", "Termin prüfen"],
    ["The suggested event had invalid details. Ask the assistant to correct them.", "El evento sugerido contiene datos no válidos. Pide al asistente que los corrija.", "L’événement suggéré contient des informations invalides. Demandez à l’assistant de les corriger.", "Der vorgeschlagene Termin enthält ungültige Angaben. Bitte den Assistenten, sie zu korrigieren."],
    ["We couldn't finish that request.", "No pudimos completar esa solicitud.", "Nous n’avons pas pu terminer cette demande.", "Diese Anfrage konnte nicht abgeschlossen werden."],
    ["The assistant returned an unreadable response. Please try again.", "El asistente devolvió una respuesta ilegible. Inténtalo de nuevo.", "L’assistant a renvoyé une réponse illisible. Veuillez réessayer.", "Der Assistent hat eine unlesbare Antwort zurückgegeben. Bitte versuche es erneut."],
    ["Calendar context not shared. Do not invent existing events or availability.", "No se comparte el contexto del calendario. No inventes eventos ni disponibilidad.", "Le contexte du calendrier n’est pas partagé. N’inventez pas d’événements ni de disponibilités.", "Kalenderkontext wird nicht geteilt. Erfinde keine vorhandenen Termine oder Verfügbarkeiten."],
    ["Calendar context removed. Future requests start with a fresh conversation.", "Se ha eliminado el contexto del calendario. Las próximas solicitudes empezarán una conversación nueva.", "Le contexte du calendrier a été supprimé. Les prochaines demandes commenceront une nouvelle conversation.", "Der Kalenderkontext wurde entfernt. Künftige Anfragen beginnen mit einer neuen Unterhaltung."],
    ["Upcoming titles, dates, times, and locations will be shared with your next message.", "Los títulos, fechas, horas y ubicaciones próximos se compartirán con tu siguiente mensaje.", "Les titres, dates, heures et lieux à venir seront partagés avec votre prochain message.", "Künftige Titel, Daten, Uhrzeiten und Orte werden mit deiner nächsten Nachricht geteilt."],
    ["Nothing planned", "Nada previsto", "Rien de prévu", "Nichts geplant"],
    ["A little breathing room.", "Un poco de tranquilidad.", "Un peu de répit.", "Ein wenig Freiraum."],
    ["Your day is yours to shape. Add something worth making time for.", "Tu día es tuyo. Añade algo a lo que merezca la pena dedicar tiempo.", "Votre journée vous appartient. Ajoutez quelque chose qui mérite d’y consacrer du temps.", "Dein Tag gehört dir. Füge etwas hinzu, wofür sich Zeit lohnt."],
    ["Add your first event", "Añadir tu primer evento", "Ajouter votre premier événement", "Ersten Termin hinzufügen"],
    ["The next chapter is unwritten.", "El próximo capítulo está por escribir.", "Le prochain chapitre reste à écrire.", "Das nächste Kapitel ist noch ungeschrieben."],
    ["Add an event to start shaping the days ahead.", "Añade un evento para empezar a dar forma a los próximos días.", "Ajoutez un événement pour commencer à façonner les jours à venir.", "Füge einen Termin hinzu, um die kommenden Tage zu gestalten."],
    ["New event", "Nuevo evento", "Nouvel événement", "Neuer Termin"],
    ["No matching events or dates.", "No hay eventos ni fechas coincidentes.", "Aucun événement ou date correspondant.", "Keine passenden Termine oder Daten."],
    ["A valid time is required.", "Se necesita una hora válida.", "Une heure valide est requise.", "Eine gültige Uhrzeit ist erforderlich."],
    ["This follows your device setting automatically.", "Esto sigue automáticamente la configuración de tu dispositivo.", "Ce réglage suit automatiquement celui de votre appareil.", "Diese Einstellung folgt automatisch der Geräteeinstellung."],
    ["Selected:", "Seleccionado:", "Sélectionné :", "Ausgewählt:"],
    ["Save to apply.", "Guarda para aplicar.", "Enregistrez pour appliquer.", "Zum Anwenden speichern."],
    ["Existing event dates and times are not converted.", "Las fechas y horas de los eventos existentes no se convierten.", "Les dates et heures des événements existants ne sont pas converties.", "Bestehende Termindaten und -zeiten werden nicht umgerechnet."],
    ["No events planned for this day.", "No hay eventos previstos para este día.", "Aucun événement prévu pour cette journée.", "Für diesen Tag sind keine Termine geplant."],
    ["The assistant could not load. Check your connection and retry.", "No se pudo cargar el asistente. Comprueba tu conexión e inténtalo de nuevo.", "L’assistant n’a pas pu se charger. Vérifiez votre connexion et réessayez.", "Der Assistent konnte nicht geladen werden. Prüfe deine Verbindung und versuche es erneut."],
    ["Could not load Puter. Check your connection and retry.", "No se pudo cargar Puter. Comprueba tu conexión e inténtalo de nuevo.", "Impossible de charger Puter. Vérifiez votre connexion et réessayez.", "Puter konnte nicht geladen werden. Prüfe deine Verbindung und versuche es erneut."],
    ["Puter could not complete this request. Check your account access and try again.", "Puter no pudo completar esta solicitud. Comprueba el acceso a tu cuenta e inténtalo de nuevo.", "Puter n’a pas pu terminer cette demande. Vérifiez l’accès à votre compte et réessayez.", "Puter konnte die Anfrage nicht abschließen. Prüfe deinen Kontozugriff und versuche es erneut."],
    ["Puter could not initialise.", "Puter no pudo iniciarse.", "Puter n’a pas pu s’initialiser.", "Puter konnte nicht initialisiert werden."],
    ["Puter took too long to load. Check your connection and retry.", "Puter tardó demasiado en cargar. Comprueba tu conexión e inténtalo de nuevo.", "Le chargement de Puter a pris trop de temps. Vérifiez votre connexion et réessayez.", "Puter hat zu lange zum Laden gebraucht. Prüfe deine Verbindung und versuche es erneut."],
    ["Switch to dark appearance", "Cambiar a la apariencia oscura", "Passer à l’apparence sombre", "Zum dunklen Erscheinungsbild wechseln"],
    ["Switch to light appearance", "Cambiar a la apariencia clara", "Passer à l’apparence claire", "Zum hellen Erscheinungsbild wechseln"],
    ["Toggle appearance", "Cambiar apariencia", "Changer l’apparence", "Erscheinungsbild umschalten"],
    ["Close assistant", "Cerrar asistente", "Fermer l’assistant", "Assistent schließen"],
    ["Close filters", "Cerrar filtros", "Fermer les filtres", "Filter schließen"],
    ["Close shortcuts", "Cerrar atajos", "Fermer les raccourcis", "Tastenkürzel schließen"],
    ["Matching time zones", "Zonas horarias coincidentes", "Fuseaux horaires correspondants", "Passende Zeitzonen"],
    ["Search calendar", "Buscar en el calendario", "Rechercher dans le calendrier", "Kalender durchsuchen"],
    ["Hide details", "Ocultar detalles", "Masquer les détails", "Details ausblenden"],
    ["Show details", "Mostrar detalles", "Afficher les détails", "Details anzeigen"],
    ["Calendar: Month view", "Calendario: vista mensual", "Calendrier : vue mensuelle", "Kalender: Monatsansicht"],
    ["Calendar: Week view", "Calendario: vista semanal", "Calendrier : vue hebdomadaire", "Kalender: Wochenansicht"],
    ["Calendar: Full dates view", "Calendario: vista de todas las fechas", "Calendrier : vue toutes les dates", "Kalender: Gesamtansicht"],
    ["Full dates view. Drag up for month and week, down for full dates. Keyboard shortcuts: M, W, Y.", "Vista de todas las fechas. Arrastra hacia arriba para mes y semana, hacia abajo para todas las fechas. Atajos: M, W, Y.", "Vue toutes les dates. Faites glisser vers le haut pour le mois et la semaine, vers le bas pour toutes les dates. Raccourcis : M, W, Y.", "Gesamtansicht. Ziehe nach oben für Monat und Woche, nach unten für alle Daten. Tastenkürzel: M, W, Y."],
    ["Month view. Drag up for month and week, down for full dates. Keyboard shortcuts: M, W, Y.", "Vista mensual. Arrastra hacia arriba para mes y semana, hacia abajo para todas las fechas. Atajos: M, W, Y.", "Vue mensuelle. Faites glisser vers le haut pour le mois et la semaine, vers le bas pour toutes les dates. Raccourcis : M, W, Y.", "Monatsansicht. Ziehe nach oben für Monat und Woche, nach unten für alle Daten. Tastenkürzel: M, W, Y."],
    ["Week view. Drag up for month and week, down for full dates. Keyboard shortcuts: M, W, Y.", "Vista semanal. Arrastra hacia arriba para mes y semana, hacia abajo para todas las fechas. Atajos: M, W, Y.", "Vue hebdomadaire. Faites glisser vers le haut pour le mois et la semaine, vers le bas pour toutes les dates. Raccourcis : M, W, Y.", "Wochenansicht. Ziehe nach oben für Monat und Woche, nach unten für alle Daten. Tastenkürzel: M, W, Y."],
    ["Mark", "Marcar", "Marquer", "Markieren"],
    ["completed", "completado", "terminé", "erledigt"],
    ["Edit", "Editar", "Modifier", "Bearbeiten"],
    ["until", "hasta", "jusqu’à", "bis"],
    ["of your day", "de tu día", "de votre journée", "deines Tages"],
    ["of", "de", "sur", "von"],
    ["events today", "eventos hoy", "événements aujourd’hui", "Termine heute"],
    ["ON THE CALENDAR", "EN EL CALENDARIO", "AU CALENDRIER", "IM KALENDER"],
    ["TIME COMMITTED", "TIEMPO COMPROMETIDO", "TEMPS PLANIFIÉ", "GEBUNDENE ZEIT"],
    ["A LITTLE PROGRESS", "UN POCO DE PROGRESO", "UN PEU DE PROGRÈS", "EIN KLEINER FORTSCHRITT"],
    ["Nothing new to import.", "No hay nada nuevo que importar.", "Aucun nouvel élément à importer.", "Nichts Neues zum Importieren."],
    ["Please choose a language.", "Elige un idioma.", "Veuillez choisir une langue.", "Bitte wähle eine Sprache aus."],
    ["Reset link accepted. Choose a new password below.", "Enlace de restablecimiento aceptado. Elige una nueva contraseña abajo.", "Lien de réinitialisation accepté. Choisissez un nouveau mot de passe ci-dessous.", "Link zum Zurücksetzen akzeptiert. Lege unten ein neues Passwort fest."],
    ["Manage your account and sign-out options", "Gestiona tu cuenta y las opciones para cerrar sesión", "Gérez votre compte et les options de déconnexion", "Verwalte dein Konto und die Abmeldeoptionen"],
    ["Rule-based preview", "Vista previa basada en reglas", "Aperçu basé sur des règles", "Regelbasierte Vorschau"],
    ["Supabase could not send the email. The app maintainer needs to check SMTP settings and Auth delivery logs.", "Supabase no pudo enviar el correo. La persona responsable de la aplicación debe revisar la configuración SMTP y los registros de entrega de Auth.", "Supabase n’a pas pu envoyer l’e-mail. Le responsable de l’application doit vérifier la configuration SMTP et les journaux de livraison Auth.", "Supabase konnte die E-Mail nicht senden. Die betreuende Person muss die SMTP-Einstellungen und die Auth-Zustellprotokolle prüfen."],
    ["The email service cannot send to this address. The app maintainer must configure custom SMTP in Supabase. You can also try Google sign-in.", "El servicio de correo no puede enviar mensajes a esta dirección. La persona responsable debe configurar SMTP personalizado en Supabase. También puedes probar el acceso con Google.", "Le service de messagerie ne peut pas envoyer à cette adresse. Le responsable doit configurer un SMTP personnalisé dans Supabase. Vous pouvez aussi essayer la connexion Google.", "Der E-Mail-Dienst kann an diese Adresse nicht senden. Die betreuende Person muss benutzerdefiniertes SMTP in Supabase einrichten. Du kannst auch die Google-Anmeldung versuchen."],
    ["You’re signed in. Your calendar syncs with your account.", "Has iniciado sesión. Tu calendario se sincroniza con tu cuenta.", "Vous êtes connecté. Votre calendrier se synchronise avec votre compte.", "Du bist angemeldet. Dein Kalender wird mit deinem Konto synchronisiert."],
    ["duplicates skipped", "duplicados omitidos", "doublons ignorés", "Duplikate übersprungen"],
    ["limit reached", "límite alcanzado", "limite atteinte", "Limit erreicht"],
  ];

  ROWS.push(
    ["Auto · System settings", "Automático · configuración del sistema", "Auto · paramètres système", "Auto · Systemeinstellungen"],
    ["Auto", "Automático", "Auto", "Auto"],
    ["System settings", "Configuración del sistema", "Paramètres système", "Systemeinstellungen"],
    ["Search languages", "Buscar idiomas", "Rechercher des langues", "Sprachen suchen"],
    ["No matching languages.", "No hay idiomas coincidentes.", "Aucune langue correspondante.", "Keine passenden Sprachen."],
  );

  const PHRASES = new Map();
  const REVERSE = new Map();
  const ORIGINAL_TEXT = new WeakMap();
  ROWS.forEach((row) => {
    const english = row[0];
    const values = {};
    const asian = ASIAN_TRANSLATIONS[english] || [];
    LANGUAGE_ORDER.forEach((code, index) => {
      const translatedValue = row[index] || (index >= 4 ? asian[index - 4] : "") || english;
      values[code] = translatedValue;
      const translated = normalise(translatedValue);
      if (translated && !REVERSE.has(translated)) REVERSE.set(translated, english);
    });
    PHRASES.set(normalise(english), values);
  });

  function normalise(value) {
    return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
  }

  function resolveSystemLanguage() {
    const candidates = [];
    try {
      if (Array.isArray(navigator.languages)) candidates.push(...navigator.languages);
      if (navigator.language) candidates.push(navigator.language);
    } catch (_) {}
    for (const candidate of candidates) {
      const base = String(candidate).toLowerCase().split(/[-_]/)[0];
      if (LANGUAGES[base]) return base;
    }
    return "en";
  }

  function readSavedLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "auto" || LANGUAGES[saved]) return saved;
      const settings = JSON.parse(localStorage.getItem("calex-guest-settings-v1") || "{}");
      if (settings.language === "auto" || LANGUAGES[settings.language]) return settings.language;
    } catch (_) {}
    return "auto";
  }

  let currentPreference = readSavedLanguage();
  let currentLanguage = currentPreference === "auto" ? resolveSystemLanguage() : currentPreference;

  function locale() {
    return LANGUAGES[currentLanguage].locale;
  }

  function language() {
    return currentLanguage;
  }

  function preference() {
    return currentPreference;
  }

  function languageLabel(code) {
    if (code === "auto") return translate("Auto · System settings", currentLanguage);
    return (LANGUAGES[code] || LANGUAGES.en).label;
  }

  function isPreference(code) {
    return code === "auto" || !!LANGUAGES[code];
  }

  function translatePattern(source, code) {
    let match;
    const t = (key) => {
      const entry = PHRASES.get(normalise(key));
      return entry ? entry[code] : key;
    };
    match = source.match(/^Until (.+)$/);
    if (match) return t("Until") + " " + match[1];

    match = source.match(/^Signed in as (.+)$/);
    if (match) {
      if (code === "es") return "Sesión iniciada como " + match[1];
      if (code === "fr") return "Connecté en tant que " + match[1];
      if (code === "zh") return "已登录为 " + match[1];
      if (code === "ja") return match[1] + " としてログイン中";
      if (code === "ko") return match[1] + " 계정으로 로그인됨";
      return "Angemeldet als " + match[1];
    }

    match = source.match(/^Resend available in (\d+)s$/);
    if (match) {
      if (code === "es") return "Reenvío disponible en " + match[1] + " s";
      if (code === "fr") return "Nouvel envoi possible dans " + match[1] + " s";
      if (code === "zh") return match[1] + " 秒后可重新发送";
      if (code === "ja") return match[1] + "秒後に再送信できます";
      if (code === "ko") return match[1] + "초 후 다시 보낼 수 있습니다";
      return "Erneut senden in " + match[1] + " s möglich";
    }

    match = source.match(/^Synced at (.+?)\. Your calendar is up to date across devices\.$/);
    if (match) {
      if (code === "es") return "Sincronizado a las " + match[1] + ". Tu calendario está actualizado en todos tus dispositivos.";
      if (code === "fr") return "Synchronisé à " + match[1] + ". Votre calendrier est à jour sur tous vos appareils.";
      if (code === "zh") return "已于 " + match[1] + " 同步。你的日历在所有设备上均为最新。";
      if (code === "ja") return match[1] + " に同期しました。すべてのデバイスでカレンダーは最新です。";
      if (code === "ko") return match[1] + "에 동기화했습니다. 모든 기기의 캘린더가 최신 상태입니다.";
      return "Synchronisiert um " + match[1] + ". Dein Kalender ist auf allen Geräten aktuell.";
    }

    match = source.match(/^Imported (\d+) events?(?: · (\d+) duplicates skipped)?(?: · limit reached)?$/);
    if (match) {
      const count = Number(match[1]);
      const duplicates = match[2] ? Number(match[2]) : 0;
      const limited = source.includes("· limit reached");
      if (code === "es") return "Importados " + count + (count === 1 ? " evento" : " eventos") + (duplicates ? " · " + duplicates + " duplicados omitidos" : "") + (limited ? " · límite alcanzado" : "");
      if (code === "fr") return count + (count === 1 ? " événement importé" : " événements importés") + (duplicates ? " · " + duplicates + " doublons ignorés" : "") + (limited ? " · limite atteinte" : "");
      if (code === "zh") return "已导入 " + count + " 个事件" + (duplicates ? " · 已跳过 " + duplicates + " 个重复项" : "") + (limited ? " · 已达到上限" : "");
      if (code === "ja") return count + " 件の予定をインポートしました" + (duplicates ? " · 重複 " + duplicates + " 件をスキップ" : "") + (limited ? " · 上限に達しました" : "");
      if (code === "ko") return count + "개 일정을 가져왔습니다" + (duplicates ? " · 중복 " + duplicates + "개 건너뜀" : "") + (limited ? " · 한도에 도달함" : "");
      return count + (count === 1 ? " Termin importiert" : " Termine importiert") + (duplicates ? " · " + duplicates + " Duplikate übersprungen" : "") + (limited ? " · Limit erreicht" : "");
    }

    match = source.match(/^Calendar: (Full dates|Month|Week) view$/);
    if (match) return t("Calendar") + ": " + t(match[1]) + " " + t("view");

    match = source.match(/^(.+), (\d+) events?$/);
    if (match) {
      const count = Number(match[2]);
      const eventLabel = count === 1 ? t("event") : t("events");
      return match[1] + ", " + count + " " + eventLabel;
    }

    match = source.match(/^of (\d+) completed$/);
    if (match) {
      if (code === "es") return "de " + match[1] + " completados";
      if (code === "fr") return "sur " + match[1] + " terminés";
      if (code === "zh") return "共 " + match[1] + " 项已完成";
      if (code === "ja") return match[1] + " 件中完了";
      if (code === "ko") return match[1] + "개 중 완료";
      return "von " + match[1] + " erledigt";
    }

    match = source.match(/^Last updated: (.+)$/);
    if (match) {
      if (code === "es") return "Última actualización: " + match[1];
      if (code === "fr") return "Dernière mise à jour : " + match[1];
      if (code === "zh") return "最后更新：" + match[1];
      if (code === "ja") return "最終更新：" + match[1];
      if (code === "ko") return "마지막 업데이트: " + match[1];
      return "Zuletzt aktualisiert: " + match[1];
    }

    match = source.match(/^Effective date: (.+)$/);
    if (match) {
      if (code === "es") return "Fecha de entrada en vigor: " + match[1];
      if (code === "fr") return "Date d’entrée en vigueur : " + match[1];
      if (code === "zh") return "生效日期：" + match[1];
      if (code === "ja") return "発効日：" + match[1];
      if (code === "ko") return "시행일: " + match[1];
      return "Gültig ab: " + match[1];
    }

    match = source.match(/^To do · (\d+)$/);
    if (match) return t("To do") + " · " + match[1];

    match = source.match(/^Completed · (\d+)$/);
    if (match) return t("Completed") + " · " + match[1];

    match = source.match(/^Repeats every (\d+) (days|weeks|months|years)$/);
    if (match) {
      const n = Number(match[1]);
      const baseUnit = { days: "day", weeks: "week", months: "month", years: "year" }[match[2]];
      if (code === "es") {
        const unit = {
          day: n === 1 ? "día" : "días",
          week: n === 1 ? "semana" : "semanas",
          month: n === 1 ? "mes" : "meses",
          year: n === 1 ? "año" : "años",
        }[baseUnit];
        return "Se repite cada " + n + " " + unit;
      }
      if (code === "fr") {
        const unit = {
          day: n === 1 ? "jour" : "jours",
          week: n === 1 ? "semaine" : "semaines",
          month: n === 1 ? "mois" : "mois",
          year: n === 1 ? "an" : "ans",
        }[baseUnit];
        return "Répète " + (baseUnit === "week" ? "toutes les " : "tous les ") + n + " " + unit;
      }
      if (code === "de") {
        const unit = {
          day: n === 1 ? "Tag" : "Tage",
          week: n === 1 ? "Woche" : "Wochen",
          month: n === 1 ? "Monat" : "Monate",
          year: n === 1 ? "Jahr" : "Jahre",
        }[baseUnit];
        return "Wiederholt sich alle " + n + " " + unit;
      }
      const units = {
        zh: { day: "天", week: "周", month: "个月", year: "年" },
        ja: { day: "日", week: "週間", month: "か月", year: "年" },
        ko: { day: "일", week: "주", month: "개월", year: "년" },
      };
      if (units[code]) {
        const prefix = { zh: "每", ja: "毎", ko: "매" }[code];
        const suffix = { zh: "重复", ja: "繰り返し", ko: " 반복" }[code];
        return prefix + n + units[code][baseUnit] + suffix;
      }
    }

    match = source.match(/^Repeats (daily|weekly|monthly|yearly)$/);
    if (match) {
      const values = {
        daily: { es: "Se repite a diario", fr: "Répétition quotidienne", de: "Wiederholt sich täglich", zh: "每天重复", ja: "毎日繰り返し", ko: "매일 반복" },
        weekly: { es: "Se repite cada semana", fr: "Répétition hebdomadaire", de: "Wiederholt sich wöchentlich", zh: "每周重复", ja: "毎週繰り返し", ko: "매주 반복" },
        monthly: { es: "Se repite cada mes", fr: "Répétition mensuelle", de: "Wiederholt sich monatlich", zh: "每月重复", ja: "毎月繰り返し", ko: "매월 반복" },
        yearly: { es: "Se repite cada año", fr: "Répétition annuelle", de: "Wiederholt sich jährlich", zh: "每年重复", ja: "毎年繰り返し", ko: "매년 반복" },
      };
      return values[match[1]][code];
    }

    match = source.match(/^Mark (.+) completed$/);
    if (match) return t("Mark") + " " + match[1] + " " + t("completed");

    match = source.match(/^Edit (.+)$/);
    if (match) return t("Edit") + " " + match[1];

    match = source.match(/^Heads up: this overlaps with (.+)\. You can still save it\.$/);
    if (match) {
      if (code === "es") return "Aviso: se solapa con " + match[1] + ". Puedes guardarlo de todos modos.";
      if (code === "fr") return "Attention : ce créneau chevauche " + match[1] + ". Vous pouvez tout de même enregistrer.";
      if (code === "zh") return "提示：此时间与 " + match[1] + " 重叠。你仍然可以保存。";
      if (code === "ja") return "注意：この時間は " + match[1] + " と重複しています。そのまま保存できます。";
      if (code === "ko") return "주의: 이 시간이 " + match[1] + " 일정과 겹칩니다. 그래도 저장할 수 있습니다.";
      return "Achtung: Dieser Zeitraum überschneidet sich mit " + match[1] + ". Du kannst trotzdem speichern.";
    }

    match = source.match(/^(\d+) events?$/);
    if (match) {
      const n = Number(match[1]);
      const word = n === 1 ? t("event") : t("events");
      return n + " " + word;
    }

    match = source.match(/^(.+) · (\d+)$/);
    if (match) return t(match[1]) + " · " + match[2];

    match = source.match(/^(\d+) more$/);
    if (match) {
      if (code === "es") return "+" + match[1] + " más";
      if (code === "fr") return "+" + match[1] + " de plus";
      return "+" + match[1] + " weitere";
    }
    return null;
  }

  function englishSource(value) {
    const clean = normalise(value);
    if (PHRASES.has(clean)) return clean;
    if (REVERSE.has(clean)) return REVERSE.get(clean);
    return clean;
  }

  function translate(value, targetLanguage) {
    const code = LANGUAGES[targetLanguage] ? targetLanguage : currentLanguage;
    const original = String(value == null ? "" : value);
    const clean = normalise(original);
    if (!clean) return original;
    const source = englishSource(clean);
    const row = PHRASES.get(source);
    let translated = row ? row[code] : null;
    if (!translated && code !== "en") translated = translatePattern(source, code);
    if (!translated) return original;
    if (translated === clean) return original;
    const start = original.match(/^\s*/)[0];
    const end = original.match(/\s*$/)[0];
    return start + translated + end;
  }

  function isUserContent(node) {
    const parent = node && (node.nodeType === 1 ? node : node.parentElement);
    if (!parent) return false;
    return !!parent.closest(
      ".event-title, .cell-event, .chat-message > div, .assistant-draft strong, .profile-name, .profile-location, [data-user-content='true']",
    );
  }

  const ATTRS = ["placeholder", "title", "aria-label", "aria-description", "alt", "data-prompt"];

  function translateAttribute(element, attribute) {
    if (!element || !element.hasAttribute(attribute)) return;
    if (element.hasAttribute("data-user-content")) return;
    const before = element.getAttribute(attribute);
    const after = translate(before);
    if (after !== before) element.setAttribute(attribute, after);
  }

  function translateElement(element) {
    if (!element || element.nodeType !== 1) return;
    if (element.matches("[data-user-content='true']")) return;

    // Walk each element's direct text nodes to keep updates deterministic.
    const elements = [element, ...element.querySelectorAll("*")];
    elements.forEach((current) => {
      if (current.matches("[data-user-content='true']")) return;

      Array.from(current.childNodes).forEach((node) => {
        if (node.nodeType !== 3 || isUserContent(node)) return;
        try {
          if (!ORIGINAL_TEXT.has(node)) ORIGINAL_TEXT.set(node, node.nodeValue);
          const source = ORIGINAL_TEXT.get(node);
          const translated = translate(source);
          if (translated !== node.nodeValue) node.nodeValue = translated;
        } catch (error) {
          console.error("Calex translation skipped a text node", error);
        }
      });

      ATTRS.forEach((attribute) => translateAttribute(current, attribute));
    });
  }

  function updateWeekdayLabels() {
    if (!document.body) return;
    const monday = new Date(2024, 0, 1, 12);
    const fullWeekday = new Intl.DateTimeFormat(locale(), { weekday: "short" });
    const narrowWeekday = new Intl.DateTimeFormat(locale(), { weekday: "narrow" });
    document.querySelectorAll("#calendarScreen .weekdays span").forEach((node, index) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + index);
      const label = fullWeekday.format(day);
      if (node.textContent !== label) node.textContent = label;
    });
    document.querySelectorAll(".mini-weekdays span").forEach((node, index) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + index);
      const label = narrowWeekday.format(day);
      if (node.textContent !== label) node.textContent = label;
    });
  }

  function translateDocument() {
    document.documentElement.lang = currentLanguage;
    translateElement(document.body);
    updateWeekdayLabels();
    const pageTitle = translate(document.title);
    if (pageTitle !== document.title) document.title = pageTitle;
  }

  function setLanguage(code, options) {
    const opts = options || {};
    if (!isPreference(code)) return false;
    const nextLanguage = code === "auto" ? resolveSystemLanguage() : code;
    const changed = currentLanguage !== nextLanguage || currentPreference !== code;
    currentPreference = code;
    currentLanguage = nextLanguage;
    if (opts.persist !== false) {
      try { localStorage.setItem(STORAGE_KEY, code); } catch (_) {}
    }
    translateDocument();
    if (changed) {
      window.dispatchEvent(new CustomEvent("calex:language", { detail: code }));
      // App listeners may replace dynamic content while responding to the event.
      translateDocument();
    }
    return true;
  }

  window.addEventListener("languagechange", () => {
    if (currentPreference === "auto") setLanguage("auto", { persist: false });
  });

  function observe() {
    if (!document.body || window.__calexI18nObserver) return;
    translateDocument();
    const observer = new MutationObserver((records) => {
      records.forEach((record) => {
        if (record.type === "characterData") {
          if (isUserContent(record.target)) return;
          if (!ORIGINAL_TEXT.has(record.target))
            ORIGINAL_TEXT.set(record.target, record.target.nodeValue);
          const source = ORIGINAL_TEXT.get(record.target);
          const after = translate(source);
          if (after !== record.target.nodeValue) record.target.nodeValue = after;
          return;
        }
        if (record.type === "attributes") {
          translateAttribute(record.target, record.attributeName);
          return;
        }
        record.addedNodes.forEach((node) => {
          if (node.nodeType === 3) {
            if (!isUserContent(node)) {
              if (!ORIGINAL_TEXT.has(node)) ORIGINAL_TEXT.set(node, node.nodeValue);
              const source = ORIGINAL_TEXT.get(node);
              const after = translate(source);
              if (after !== node.nodeValue) node.nodeValue = after;
            }
          } else if (node.nodeType === 1) {
            translateElement(node);
          }
        });
      });
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS,
    });
    window.__calexI18nObserver = observer;
  }

  window.CalexI18n = {
    languages: LANGUAGES,
    language,
    preference,
    isPreference,
    languageLabel,
    locale,
    translate,
    setLanguage,
    refresh: translateDocument,
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observe, { once: true });
  } else {
    observe();
  }
})();
