import { useMemo, useState } from "react";

export const DASHBOARD_LANGUAGE_KEY = "tazabeet_dashboard_language";

export const dashboardTranslations = {
    en: {
        common: {
            languageToggle: "العربية",
            loading: "Loading...",
            failed: "Failed",
            notAvailable: "N/A",
            user: "User",
            customer: "Customer",
            service: "Service",
            phone: "Phone",
            noPhone: "No phone",
            cash: "Cash",
            egp: "EGP",
            save: "Save",
            saving: "Saving...",
            delete: "Delete",
            cancel: "Cancel",
            back: "Back",
            document: "Document",
            photo: "Photo",
            video: "Video",
        },
        worker: {
            nav: {
                dashboard: "Dashboard",
                jobs: "Jobs",
                myJobs: "My Jobs",
                schedule: "Schedule",
                messages: "Messages",
                profile: "Profile",
                logout: "Logout",
            },
            activeJobs: "Active Jobs",
            completed: "Completed",
            earnings: "Earnings",
            rating: "Rating",
            wallet: "Wallet",
            walletBalance: "Wallet balance",
            cashCollected: "Cash collected",
            platformFees: "Platform fees",
            cashDebt: "Cash debt",
            cashOrdersAvailable: "Cash orders available",
            cashOrdersBlocked: "Cash orders blocked",
            remainingBeforeBlock: "Remaining before block",
            debtLimit: "Cash block limit",
            walletTransactions: "Wallet Transactions",
            noWalletTransactions: "No wallet transactions yet.",
            paymentSetup: "Payment setup",
            cashActive: "Cash is active",
            merchantRequired: "Needs merchant setup",
            manualSetupRequired: "Needs manual setup",
            transactionTypes: {
                cash_collected: "Cash collected",
                platform_fee: "Platform fee",
                online_payment: "Online payment",
                adjustment: "Adjustment",
                payout: "Payout",
            },
            recentJobs: "Recent Jobs",
            allJobs: "All Jobs",
            filters: {
                all: "All",
                pending: "Pending",
                confirmed: "Confirmed",
                completed: "Completed",
                rejected: "Rejected",
                cancelled: "Cancelled",
            },
            table: {
                customer: "Customer",
                phone: "Phone",
                address: "Address",
                payment: "Payment",
                price: "Price",
                date: "Date",
                time: "Time",
                status: "Status",
                actions: "Actions",
            },
            noJobs: "No jobs yet.",
            noAddress: "No address provided",
            notEstimated: "Not estimated",
            noFinalPrice: "No final price",
            openSlot: "Open slot",
            accept: "Accept",
            reject: "Reject",
            finalPrice: "Final price",
            note: "Note",
            sendPrice: "Send Price",
            onMyWay: "On my way",
            arrived: "Arrived",
            started: "Started",
            complete: "Complete",
            done: "Done",
            conversations: "Conversations",
            noMessages: "No messages yet.",
            loadingMessages: "Loading messages...",
            conversation: "Conversation",
            writeReply: "Write a reply...",
            send: "Send",
            profilePhoto: "Profile Photo",
            workerProfileAlt: "Worker profile",
            experience: "Experience",
            writeExperience: "Write your experience...",
            saveExperience: "Save Experience",
            addPortfolio: "Add Portfolio",
            myPortfolio: "My Portfolio",
            title: "Title",
            description: "Description",
            addToPortfolio: "Add to Portfolio",
            noPortfolio: "No portfolio yet",
            workerVerification: "Worker Verification",
            status: "Status",
            verificationHelp: "Upload your ID, license, or certificate. Admin must verify you before you can accept jobs.",
        },
        customer: {
            profile: "My Profile",
            logout: "Logout",
            accountInfo: "Account Info",
            name: "Name",
            email: "Email",
            phone: "Phone",
            favoriteWorkers: "Favorite Workers",
            noFavoriteWorkers: "No favorite workers yet.",
            myBookings: "My Bookings",
            noActiveBookings: "No active bookings.",
            worker: "Worker",
            workerPhone: "Worker Phone",
            issue: "Issue",
            messages: "Messages",
            reportBooking: "Report this booking",
            chooseReason: "Choose reason",
            moreDetails: "More details...",
            sendReport: "Send Report",
            previousServices: "Previous Services",
            noCompletedServices: "No completed services yet.",
            completed: "Completed",
            writeReview: "Write review...",
            submit: "Submit",
            estimate: "Estimate",
            finalPrice: "Final price",
            status: "Status",
            note: "Note",
            acceptPrice: "Accept Price",
            decline: "Decline",
            waitingFinalPrice: "Waiting for worker final price.",
            bookingRequested: "Booking requested",
            bookingTimeline: "Booking timeline",
            messageWorker: "Message your worker...",
            send: "Send",
            loadingMessages: "Loading messages...",
            noMessages: "No messages yet.",
            dashboardTitle: "Customer Dashboard",
            dashboardWelcome: "Welcome! (We will add booking + appointments here next)",
            bookAppointment: "Book Appointment",
            backHome: "Back to Home",
            bookingComing: "Booking page coming next.",
        },
        notifications: {
            title: "Notifications",
            markAllRead: "Mark all read",
            empty: "No notifications yet.",
            markFailed: "Failed to mark notifications read",
        },
        schedule: {
            title: "Schedule",
            help: "Add your available time slots",
            addSlotTitle: "Add Available Slot",
            selectService: "Select Service",
            start: "Start",
            end: "End",
            addSlot: "Add Slot",
            calendar: "Calendar",
            loading: "(Loading...)",
            deleteSlot: "Delete Slot",
            deleteConfirm: "Are you sure you want to delete this slot?",
            failedLoad: "Failed to load schedule",
            selectServiceError: "Please select a service",
            requiredTimeError: "Start and end time are required.",
            endAfterStartError: "End must be after start.",
            createFailed: "Failed to create event",
            deleteFailed: "Failed to delete",
        },
        statuses: {
            available: "Available",
            pending: "Pending",
            confirmed: "Confirmed",
            accepted: "Accepted",
            completed: "Completed",
            rejected: "Rejected",
            cancelled: "Cancelled",
            not_submitted: "Not submitted",
            verified: "Verified",
            under_review: "Under review",
        },
        progress: {
            requested: "Requested",
            accepted: "Accepted",
            price_sent: "Price sent",
            price_accepted: "Price accepted",
            on_the_way: "On the way",
            arrived: "Arrived",
            work_started: "Work started",
            completed: "Completed",
            cancelled: "Cancelled",
            slot_created: "Slot created",
        },
        payment: {
            cash: "Cash",
            card: "Card",
            credit_card: "Credit card",
            wallet: "Wallet",
        },
        services: {
            Plumbing: "Plumbing",
            Electrical: "Electrical",
            Cleaning: "Cleaning",
            Painting: "Painting",
            Carpentry: "Carpentry",
            "AC Repair": "AC Repair",
            "Pest Control": "Pest Control",
            Carpets: "Carpets",
            Alumetal: "Alumetal",
            Tiling: "Tiling",
            "Gypsum Boards": "Gypsum Boards",
            Appliances: "Appliances",
        },
        reports: {
            workerNoShow: "Worker did not arrive",
            wrongFinalPrice: "Wrong final price",
            badBehavior: "Bad behavior",
            poorService: "Poor service",
        },
        toasts: {
            selectRating: "Please select rating",
            submitRatingFailed: "Failed to submit rating",
            ratingSubmitted: "Rating submitted.",
            submitRatingError: "Error submitting rating",
            priceResponseFailed: "Failed to update price response",
            priceResponseError: "Error updating price response",
            chooseReportReason: "Choose a report reason",
            reportFailed: "Failed to send report",
            reportSent: "Report sent to admin.",
            reportError: "Error sending report",
            loadMessagesFailed: "Failed to load messages",
            loadMessagesError: "Error loading messages",
            sendMessageFailed: "Failed to send message",
            messageSent: "Message sent.",
            sendMessageError: "Error sending message",
            replyFailed: "Failed to send reply",
            replySent: "Reply sent.",
            replyError: "Error sending reply",
            jobCompleted: "Job completed.",
            completeError: "Error completing job",
            jobAccepted: "Job accepted.",
            acceptError: "Error accepting job",
            enterFinalPrice: "Enter the final price.",
            finalPriceFailed: "Failed to send final price",
            finalPriceSent: "Final price sent to customer.",
            finalPriceError: "Error sending final price",
            progressFailed: "Failed to update progress",
            progressUpdated: "Progress updated.",
            progressError: "Error updating progress",
            jobRejected: "Job rejected.",
            rejectError: "Error rejecting job",
            jobCancelled: "Job cancelled.",
            cancelError: "Error cancelling job",
            profileSaveFailed: "Failed to save profile",
            profileSaved: "Profile saved.",
            profileSaveError: "Error saving profile",
            profilePhotoImage: "Profile photo must be an image",
            titleRequired: "Title is required",
        },
    },
    ar: {
        common: {
            languageToggle: "English",
            loading: "جاري التحميل...",
            failed: "فشل",
            notAvailable: "غير متاح",
            user: "مستخدم",
            customer: "العميل",
            service: "الخدمة",
            phone: "الهاتف",
            noPhone: "لا يوجد هاتف",
            cash: "نقدي",
            egp: "جنيه",
            save: "حفظ",
            saving: "جاري الحفظ...",
            delete: "حذف",
            cancel: "إلغاء",
            back: "رجوع",
            document: "مستند",
            photo: "صورة",
            video: "فيديو",
        },
        worker: {
            nav: {
                dashboard: "لوحة التحكم",
                jobs: "الأعمال",
                myJobs: "أعمالي",
                schedule: "الجدول",
                messages: "الرسائل",
                profile: "الملف الشخصي",
                logout: "تسجيل الخروج",
            },
            activeJobs: "الأعمال النشطة",
            completed: "المكتملة",
            earnings: "الأرباح",
            rating: "التقييم",
            wallet: "المحفظة",
            walletBalance: "رصيد المحفظة",
            cashCollected: "الكاش المحصل",
            platformFees: "رسوم المنصة",
            cashDebt: "مديونية الكاش",
            cashOrdersAvailable: "طلبات الكاش متاحة",
            cashOrdersBlocked: "طلبات الكاش محظورة",
            remainingBeforeBlock: "المتبقي قبل الحظر",
            debtLimit: "حد حظر الكاش",
            walletTransactions: "حركات المحفظة",
            noWalletTransactions: "لا توجد حركات في المحفظة بعد.",
            paymentSetup: "إعداد الدفع",
            cashActive: "الكاش مفعل",
            merchantRequired: "يحتاج إعداد تاجر",
            manualSetupRequired: "يحتاج إعداد يدوي",
            transactionTypes: {
                cash_collected: "كاش محصل",
                platform_fee: "رسوم المنصة",
                online_payment: "دفع أونلاين",
                adjustment: "تعديل",
                payout: "سحب",
            },
            recentJobs: "الأعمال الأخيرة",
            allJobs: "كل الأعمال",
            filters: {
                all: "الكل",
                pending: "قيد الانتظار",
                confirmed: "مؤكدة",
                completed: "مكتملة",
                rejected: "مرفوضة",
                cancelled: "ملغاة",
            },
            table: {
                customer: "العميل",
                phone: "الهاتف",
                address: "العنوان",
                payment: "الدفع",
                price: "السعر",
                date: "التاريخ",
                time: "الوقت",
                status: "الحالة",
                actions: "الإجراءات",
            },
            noJobs: "لا توجد أعمال بعد.",
            noAddress: "لا يوجد عنوان",
            notEstimated: "لم يتم التقدير",
            noFinalPrice: "لا يوجد سعر نهائي",
            openSlot: "موعد متاح",
            accept: "قبول",
            reject: "رفض",
            finalPrice: "السعر النهائي",
            note: "ملاحظة",
            sendPrice: "إرسال السعر",
            onMyWay: "في الطريق",
            arrived: "وصلت",
            started: "بدأت",
            complete: "إنهاء",
            done: "تم",
            conversations: "المحادثات",
            noMessages: "لا توجد رسائل بعد.",
            loadingMessages: "جاري تحميل الرسائل...",
            conversation: "محادثة",
            writeReply: "اكتب رد...",
            send: "إرسال",
            profilePhoto: "صورة الملف الشخصي",
            workerProfileAlt: "صورة العامل",
            experience: "الخبرة",
            writeExperience: "اكتب خبرتك...",
            saveExperience: "حفظ الخبرة",
            addPortfolio: "إضافة أعمال سابقة",
            myPortfolio: "أعمالي السابقة",
            title: "العنوان",
            description: "الوصف",
            addToPortfolio: "إضافة إلى الأعمال",
            noPortfolio: "لا توجد أعمال سابقة بعد",
            workerVerification: "توثيق العامل",
            status: "الحالة",
            verificationHelp: "ارفع البطاقة أو الرخصة أو الشهادة. يجب أن يراجعها الأدمن قبل قبول الأعمال.",
        },
        customer: {
            profile: "ملفي الشخصي",
            logout: "تسجيل الخروج",
            accountInfo: "بيانات الحساب",
            name: "الاسم",
            email: "البريد الإلكتروني",
            phone: "الهاتف",
            favoriteWorkers: "العمال المفضلون",
            noFavoriteWorkers: "لا يوجد عمال مفضلون بعد.",
            myBookings: "حجوزاتي",
            noActiveBookings: "لا توجد حجوزات نشطة.",
            worker: "العامل",
            workerPhone: "هاتف العامل",
            issue: "المشكلة",
            messages: "الرسائل",
            reportBooking: "الإبلاغ عن هذا الحجز",
            chooseReason: "اختر السبب",
            moreDetails: "تفاصيل إضافية...",
            sendReport: "إرسال البلاغ",
            previousServices: "الخدمات السابقة",
            noCompletedServices: "لا توجد خدمات مكتملة بعد.",
            completed: "مكتملة",
            writeReview: "اكتب تقييمك...",
            submit: "إرسال",
            estimate: "التقدير",
            finalPrice: "السعر النهائي",
            status: "الحالة",
            note: "ملاحظة",
            acceptPrice: "قبول السعر",
            decline: "رفض",
            waitingFinalPrice: "في انتظار السعر النهائي من العامل.",
            bookingRequested: "تم طلب الحجز",
            bookingTimeline: "مسار الحجز",
            messageWorker: "راسل العامل...",
            send: "إرسال",
            loadingMessages: "جاري تحميل الرسائل...",
            noMessages: "لا توجد رسائل بعد.",
            dashboardTitle: "لوحة تحكم العميل",
            dashboardWelcome: "أهلا بك! سنضيف الحجز والمواعيد هنا لاحقا",
            bookAppointment: "احجز موعد",
            backHome: "العودة للرئيسية",
            bookingComing: "صفحة الحجز قادمة قريبا.",
        },
        notifications: {
            title: "الإشعارات",
            markAllRead: "تحديد الكل كمقروء",
            empty: "لا توجد إشعارات بعد.",
            markFailed: "فشل تحديد الإشعارات كمقروءة",
        },
        schedule: {
            title: "الجدول",
            help: "أضف المواعيد المتاحة لك",
            addSlotTitle: "إضافة موعد متاح",
            selectService: "اختر الخدمة",
            start: "البداية",
            end: "النهاية",
            addSlot: "إضافة موعد",
            calendar: "التقويم",
            loading: "(جاري التحميل...)",
            deleteSlot: "حذف الموعد",
            deleteConfirm: "هل أنت متأكد أنك تريد حذف هذا الموعد؟",
            failedLoad: "فشل تحميل الجدول",
            selectServiceError: "من فضلك اختر خدمة",
            requiredTimeError: "وقت البداية والنهاية مطلوبان.",
            endAfterStartError: "يجب أن تكون النهاية بعد البداية.",
            createFailed: "فشل إنشاء الموعد",
            deleteFailed: "فشل الحذف",
        },
        statuses: {
            available: "متاح",
            pending: "قيد الانتظار",
            confirmed: "مؤكد",
            accepted: "مقبول",
            completed: "مكتمل",
            rejected: "مرفوض",
            cancelled: "ملغي",
            not_submitted: "لم يتم التقديم",
            verified: "موثق",
            under_review: "قيد المراجعة",
        },
        progress: {
            requested: "تم الطلب",
            accepted: "تم القبول",
            price_sent: "تم إرسال السعر",
            price_accepted: "تم قبول السعر",
            on_the_way: "في الطريق",
            arrived: "وصل العامل",
            work_started: "بدأ العمل",
            completed: "اكتمل",
            cancelled: "ملغي",
            slot_created: "تم إنشاء الموعد",
        },
        payment: {
            cash: "نقدي",
            card: "بطاقة",
            credit_card: "بطاقة ائتمان",
            wallet: "محفظة",
        },
        services: {
            Plumbing: "سباكة",
            Electrical: "كهرباء",
            Cleaning: "تنظيف",
            Painting: "دهانات",
            Carpentry: "نجارة",
            "AC Repair": "صيانة تكييف",
            "Pest Control": "مكافحة حشرات",
            Carpets: "سجاد",
            Alumetal: "ألوميتال",
            Tiling: "تركيب بلاط",
            "Gypsum Boards": "جبس بورد",
            Appliances: "أجهزة منزلية",
        },
        reports: {
            workerNoShow: "العامل لم يصل",
            wrongFinalPrice: "السعر النهائي غير صحيح",
            badBehavior: "سلوك سيئ",
            poorService: "خدمة ضعيفة",
        },
        toasts: {
            selectRating: "من فضلك اختر التقييم",
            submitRatingFailed: "فشل إرسال التقييم",
            ratingSubmitted: "تم إرسال التقييم.",
            submitRatingError: "حدث خطأ أثناء إرسال التقييم",
            priceResponseFailed: "فشل تحديث رد السعر",
            priceResponseError: "حدث خطأ أثناء تحديث رد السعر",
            chooseReportReason: "اختر سبب البلاغ",
            reportFailed: "فشل إرسال البلاغ",
            reportSent: "تم إرسال البلاغ للأدمن.",
            reportError: "حدث خطأ أثناء إرسال البلاغ",
            loadMessagesFailed: "فشل تحميل الرسائل",
            loadMessagesError: "حدث خطأ أثناء تحميل الرسائل",
            sendMessageFailed: "فشل إرسال الرسالة",
            messageSent: "تم إرسال الرسالة.",
            sendMessageError: "حدث خطأ أثناء إرسال الرسالة",
            replyFailed: "فشل إرسال الرد",
            replySent: "تم إرسال الرد.",
            replyError: "حدث خطأ أثناء إرسال الرد",
            jobCompleted: "تم إنهاء العمل.",
            completeError: "حدث خطأ أثناء إنهاء العمل",
            jobAccepted: "تم قبول العمل.",
            acceptError: "حدث خطأ أثناء قبول العمل",
            enterFinalPrice: "أدخل السعر النهائي.",
            finalPriceFailed: "فشل إرسال السعر النهائي",
            finalPriceSent: "تم إرسال السعر النهائي للعميل.",
            finalPriceError: "حدث خطأ أثناء إرسال السعر النهائي",
            progressFailed: "فشل تحديث التقدم",
            progressUpdated: "تم تحديث التقدم.",
            progressError: "حدث خطأ أثناء تحديث التقدم",
            jobRejected: "تم رفض العمل.",
            rejectError: "حدث خطأ أثناء رفض العمل",
            jobCancelled: "تم إلغاء العمل.",
            cancelError: "حدث خطأ أثناء إلغاء العمل",
            profileSaveFailed: "فشل حفظ الملف الشخصي",
            profileSaved: "تم حفظ الملف الشخصي.",
            profileSaveError: "حدث خطأ أثناء حفظ الملف الشخصي",
            profilePhotoImage: "يجب أن تكون صورة الملف الشخصي صورة",
            titleRequired: "العنوان مطلوب",
        },
    },
};

const dynamicArabic = {
    "Job completed": "تم إنهاء العمل",
    "Your service was marked completed. You can leave a review now.": "تم وضع الخدمة كمكتملة. يمكنك ترك تقييم الآن.",
    "Worker progress update": "تحديث تقدم العامل",
    "Work started": "بدأ العمل",
    "Worker arrived": "وصل العامل",
    "Worker is on the Way": "العامل في الطريق",
    "Final price sent": "تم إرسال السعر النهائي",
    "Booking requested": "تم طلب الحجز",
    "Price sent": "تم إرسال السعر",
    "Price accepted": "تم قبول السعر",
};

export function getStoredDashboardLanguage() {
    try {
        return localStorage.getItem(DASHBOARD_LANGUAGE_KEY) === "ar" ? "ar" : "en";
    } catch (err) {
        return "en";
    }
}

function getNestedValue(source, key) {
    return key.split(".").reduce((current, part) => current?.[part], source);
}

export function translate(language, key, params = {}) {
    const safeLanguage = language === "ar" ? "ar" : "en";
    const value =
        getNestedValue(dashboardTranslations[safeLanguage], key) ??
        getNestedValue(dashboardTranslations.en, key) ??
        key;

    if (typeof value !== "string") return key;

    return value.replace(/\{\{(\w+)\}\}/g, (_, paramKey) =>
        params[paramKey] === undefined ? "" : String(params[paramKey])
    );
}

export function useDashboardLanguage() {
    const [language, setLanguageState] = useState(getStoredDashboardLanguage);

    const setLanguage = (nextLanguage) => {
        const safeLanguage = nextLanguage === "ar" ? "ar" : "en";
        setLanguageState(safeLanguage);
        try {
            localStorage.setItem(DASHBOARD_LANGUAGE_KEY, safeLanguage);
        } catch (err) {
            console.log(err);
        }
    };

    const t = useMemo(() => {
        return (key, params) => translate(language, key, params);
    }, [language]);

    return {
        language,
        isArabic: language === "ar",
        setLanguage,
        toggleLanguage: () => setLanguage(language === "ar" ? "en" : "ar"),
        t,
    };
}

export function formatServiceName(language, service) {
    if (!service) return translate(language, "common.service");
    return dashboardTranslations[language]?.services?.[service] || service;
}

export function translateStatus(language, status) {
    if (!status) return translate(language, "common.notAvailable");
    const normalized = String(status).toLowerCase();
    return dashboardTranslations[language]?.statuses?.[normalized] || status.replace(/_/g, " ");
}

export function translateProgress(language, progressStatus) {
    if (!progressStatus) return translate(language, "progress.slot_created");
    const normalized = String(progressStatus).toLowerCase();
    return dashboardTranslations[language]?.progress?.[normalized] || translate(language, "progress.slot_created");
}

export function formatPaymentType(language, paymentType) {
    if (!paymentType) return translate(language, "common.cash");
    const normalized = String(paymentType).toLowerCase();
    const translated = dashboardTranslations[language]?.payment?.[normalized];
    if (translated) return translated;

    return String(paymentType)
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export function formatCurrency(language, currency = "EGP") {
    if (language === "ar" && String(currency).toUpperCase() === "EGP") return translate(language, "common.egp");
    return currency;
}

export function translateDashboardText(language, value) {
    if (language !== "ar" || !value) return value;
    const text = String(value);
    if (dynamicArabic[text]) return dynamicArabic[text];

    const finalPriceMatch = text.match(/^Worker sent final price: (.+)\.$/);
    if (finalPriceMatch) return `أرسل العامل السعر النهائي: ${finalPriceMatch[1]}.`;

    return text;
}

export function dashboardLocale(language) {
    return language === "ar" ? "ar-EG" : "en-US";
}
