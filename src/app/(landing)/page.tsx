"use client";

import React from "react";
import { Download } from "lucide-react";
import dynamic from "next/dynamic";
import { motion, Variants } from "framer-motion";
import { ScrollToTop } from "@/components/landing/ScrollToTop";

// Lazy load section components for better performance
const FeaturesSection = dynamic(
  () =>
    import("@/components/landing/FeaturesSection").then(
      (mod) => mod.FeaturesSection,
    ),
  { ssr: true },
);
const InteractiveLearningSection = dynamic(() =>
  import("@/components/landing/InteractiveLearningSection").then(
    (mod) => mod.InteractiveLearningSection,
  ),
);
const ReviewSection = dynamic(() =>
  import("@/components/landing/ReviewSection").then((mod) => mod.ReviewSection),
);
const HowItWorksSection = dynamic(() =>
  import("@/components/landing/HowItWorksSection").then(
    (mod) => mod.HowItWorksSection,
  ),
);
const LearningTracksSection = dynamic(() =>
  import("@/components/landing/LearningTracksSection").then(
    (mod) => mod.LearningTracksSection,
  ),
);
const CTASection = dynamic(() =>
  import("@/components/landing/CTASection").then((mod) => mod.CTASection),
);
const FAQSection = dynamic(() =>
  import("@/components/landing/FAQSection").then((mod) => mod.FAQSection),
);

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Ambient Glows */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute top-0 right-1/4 w-125 h-125 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute bottom-1/4 left-1/4 w-150 h-150 bg-blue-500/10 rounded-full blur-[150px] pointer-events-none"
      />

      {/* --- 1. Main Hero Section --- */}
      <section
        id="home"
        className="relative z-10 max-w-350 mx-auto px-6 lg:px-16 pt-32 lg:pt-24 pb-20 flex flex-col lg:flex-row items-center justify-between gap-12 min-h-[calc(100vh-120px)]"
      >
        {/* Text Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.2 } },
          }}
          className="flex-1 flex flex-col items-start text-right"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-4xl md:text-6xl lg:text-[5.5rem] font-black mb-6 leading-tight"
          >
            <span className="text-[#3b82f6] block mb-2 hover:scale-105 transition-transform duration-300 origin-right">
              النخبة الأوائل
            </span>
            <span className="text-white">تعلّم، تدرب، ونافس</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-xl mb-12 font-medium"
          >
            تطبيق تعليمي يساعدك على حل الأسئلة المؤتمتة، فهم أخطائك، مراجعة
            الأسئلة الصعبة، متابعة تقدمك، واكتشاف نقاط ضعفك خطوة بخطوة.
          </motion.p>

          <motion.button
            variants={fadeInUp}
            whileHover={{
              y: -5,
              boxShadow: "0 20px 25px -5px rgba(37, 99, 235, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            className="bg-[#2563eb] text-white px-8 py-4 rounded-xl text-md font-bold transition-all shadow-xl shadow-blue-900/30 flex items-center gap-3"
          >
            تحميل التطبيق مباشرة
            <Download className="h-6 w-6 animate-bounce" />
          </motion.button>
        </motion.div>

        {/* Image Area */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={slideInLeft}
          className="flex-1 relative flex justify-center lg:justify-end items-center w-full mt-16 lg:mt-0"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/40 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            src="./landing/phones-mockup.png"
            alt="واجهة تطبيق النخبة الأوائل"
            className="relative z-10 w-full max-w-md lg:max-w-2xl object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
          />
        </motion.div>
      </section>

      {/* --- 2. Why Elite Firsts? Section --- */}
      <motion.div
        id="features"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="relative z-20 pt-20"
      >
        <FeaturesSection />
      </motion.div>

      {/* --- 3. Interactive Learning Section --- */}
      <motion.div
        id="question-types"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={slideInRight}
        className="relative z-20 pt-20"
      >
        <InteractiveLearningSection />
      </motion.div>

      {/* --- 4. Review Mistakes Section --- */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={slideInLeft}
        className="relative z-20 pt-20"
      >
        <ReviewSection />
      </motion.div>

      {/* --- 5. How It Works Section --- */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={scaleUp}
        className="relative z-20 pt-20"
      >
        <HowItWorksSection />
      </motion.div>

      {/* --- 6. Learning Tracks Section --- */}
      <motion.div
        id="tracks"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
        className="relative z-20 pt-20"
      >
        <LearningTracksSection />
      </motion.div>

      {/* --- CTA Section --- */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={scaleUp}
        className="relative z-20 pt-20"
      >
        <CTASection />
      </motion.div>

      {/* --- FAQ Section --- */}
      <motion.div
        id="faq"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeInUp}
        className="relative z-20 pt-20"
      >
        <FAQSection />
      </motion.div>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  );
}
