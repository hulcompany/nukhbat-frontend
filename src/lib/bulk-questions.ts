import type {
  BulkQuestionInput,
  BulkQuestionTarget,
  ClassifyItemInput,
  QuestionFillBlankInput,
  QuestionMatchItemInput,
  QuestionOptionGroupInput,
  QuestionOrderItemInput,
} from "@/types/question";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getRequiredText(value: unknown, fieldLabel: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldLabel}: يجب إدخال نص غير فارغ`);
  }
  return value;
}

function getOptionalTips(value: unknown, label: string): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) {
    throw new Error(`${label}: يجب أن تكون النصائح مصفوفة نصية`);
  }
  return value.map((tip, index) =>
    getRequiredText(tip, `${label}: النصيحة رقم ${index + 1}`),
  );
}

function getOptionGroups(
  value: unknown,
  label: string,
): QuestionOptionGroupInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label}: يجب إضافة مجموعة خيارات واحدة على الأقل`);
  }

  return value.map((group, groupIndex) => {
    if (!isRecord(group)) {
      throw new Error(`${label}: مجموعة الخيارات رقم ${groupIndex + 1} غير صالحة`);
    }
    if (!Number.isInteger(group.index) || (group.index as number) < 0) {
      throw new Error(`${label}: يجب تحديد index صالح لكل مجموعة خيارات`);
    }
    if (!Array.isArray(group.options) || group.options.length < 2) {
      throw new Error(
        `${label}: يجب أن تحتوي مجموعة الخيارات رقم ${groupIndex + 1} على خيارين على الأقل`,
      );
    }

    const options = group.options.map((option, optionIndex) => {
      if (!isRecord(option)) {
        throw new Error(
          `${label}: الخيار رقم ${optionIndex + 1} في المجموعة ${groupIndex + 1} غير صالح`,
        );
      }
      const text = getRequiredText(
        option.text,
        `${label}: نص الخيار رقم ${optionIndex + 1}`,
      );
      if (typeof option.isCorrect !== "boolean") {
        throw new Error(
          `${label}: يجب تحديد isCorrect للخيار رقم ${optionIndex + 1}`,
        );
      }
      return { text, isCorrect: option.isCorrect };
    });

    if (options.filter((option) => option.isCorrect).length !== 1) {
      throw new Error(
        `${label}: يجب تحديد إجابة صحيحة واحدة لكل مجموعة خيارات`,
      );
    }

    return {
      ...(typeof group.title === "string" && group.title.trim()
        ? { title: group.title }
        : {}),
      index: group.index as number,
      options,
    };
  });
}

function getMatchingItems(
  value: unknown,
  label: string,
): QuestionMatchItemInput[] {
  if (!Array.isArray(value) || value.length < 3) {
    throw new Error(`${label}: يجب إضافة ثلاثة عناصر توصيل على الأقل`);
  }

  return value.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`${label}: عنصر التوصيل رقم ${index + 1} غير صالح`);
    }
    if (item.type !== "base" && item.type !== "match") {
      throw new Error(
        `${label}: نوع عنصر التوصيل رقم ${index + 1} يجب أن يكون base أو match`,
      );
    }
    const text = getRequiredText(
      item.text,
      `${label}: نص عنصر التوصيل رقم ${index + 1}`,
    );
    if (
      item.correctIndex !== undefined &&
      (!Number.isInteger(item.correctIndex) || (item.correctIndex as number) < 0)
    ) {
      throw new Error(
        `${label}: correctIndex غير صالح في عنصر التوصيل رقم ${index + 1}`,
      );
    }

    return {
      text,
      type: item.type,
      ...(item.correctIndex !== undefined
        ? { correctIndex: item.correctIndex as number }
        : {}),
    };
  });
}

function getFillBlanks(value: unknown, label: string): QuestionFillBlankInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label}: يجب إضافة فراغ واحد على الأقل`);
  }

  return value.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`${label}: إعداد الفراغ رقم ${index + 1} غير صالح`);
    }
    if (!Number.isInteger(item.index) || (item.index as number) < 0) {
      throw new Error(`${label}: يجب تحديد index صالح لكل فراغ`);
    }
    if (!Array.isArray(item.answers) || item.answers.length === 0) {
      throw new Error(`${label}: يجب إضافة إجابة واحدة على الأقل لكل فراغ`);
    }

    return {
      index: item.index as number,
      answers: item.answers.map((answer, answerIndex) =>
        getRequiredText(
          answer,
          `${label}: إجابة الفراغ ${index + 1} رقم ${answerIndex + 1}`,
        ),
      ),
    };
  });
}

function getOrders(value: unknown, label: string): QuestionOrderItemInput[] {
  if (!Array.isArray(value) || value.length < 2) {
    throw new Error(`${label}: يجب إضافة عنصرين للترتيب على الأقل`);
  }

  return value.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`${label}: عنصر الترتيب رقم ${index + 1} غير صالح`);
    }
    return {
      text: getRequiredText(
        item.text,
        `${label}: نص عنصر الترتيب رقم ${index + 1}`,
      ),
    };
  });
}

function getClassifyItems(value: unknown, label: string): ClassifyItemInput[] {
  if (!Array.isArray(value) || value.length < 4) {
    throw new Error(`${label}: يجب إضافة تصنيفين وعنصرين على الأقل`);
  }

  const items = value.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`${label}: عنصر التصنيف رقم ${index + 1} غير صالح`);
    }
    if (item.type !== "category" && item.type !== "item") {
      throw new Error(
        `${label}: نوع عنصر التصنيف رقم ${index + 1} يجب أن يكون category أو item`,
      );
    }
    const text = getRequiredText(
      item.text,
      `${label}: نص عنصر التصنيف رقم ${index + 1}`,
    );

    if (item.type === "category") return { text, type: "category" as const };

    if (
      !Number.isInteger(item.correctCategoryIndex) ||
      (item.correctCategoryIndex as number) < 0
    ) {
      throw new Error(
        `${label}: يجب تحديد correctCategoryIndex صالح للعنصر رقم ${index + 1}`,
      );
    }
    return {
      text,
      type: "item" as const,
      correctCategoryIndex: item.correctCategoryIndex as number,
    };
  });

  const categories = items.filter((item) => item.type === "category");
  const classifyItems = items.filter((item) => item.type === "item");
  if (categories.length < 2 || classifyItems.length < 2) {
    throw new Error(`${label}: يجب إضافة تصنيفين وعنصرين على الأقل`);
  }
  if (
    classifyItems.some(
      (item) => (item.correctCategoryIndex ?? 0) >= categories.length,
    )
  ) {
    throw new Error(`${label}: correctCategoryIndex يشير إلى تصنيف غير موجود`);
  }

  return items;
}

/**
 * Parses a bulk-question JSON file and attaches the route-specific target.
 * Any `purpose`, `courseId`, or `lessonId` included in the uploaded file is
 * intentionally ignored so questions cannot be imported into another target.
 */
export function parseBulkQuestions(
  text: string,
  target: BulkQuestionTarget,
): BulkQuestionInput[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("ملف غير صالح: يجب أن يكون بصيغة JSON");
  }

  const questions = isRecord(parsed) ? parsed.questions : undefined;
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("يجب أن يحتوي الملف على مصفوفة questions غير فارغة");
  }

  return questions.map<BulkQuestionInput>((question, index) => {
    const label = `السؤال رقم ${index + 1}`;
    if (!isRecord(question)) {
      throw new Error(`${label}: تنسيق السؤال غير صالح`);
    }

    const title = getRequiredText(question.title, `${label}: نص السؤال`);
    const tips = getOptionalTips(question.tips, label);
    const base = {
      title,
      ...target,
      ...(tips ? { tips } : {}),
    };

    if (question.type === "options") {
      return {
        ...base,
        type: "options",
        optionGroups: getOptionGroups(
          question.optionGroups ??
            (Array.isArray(question.options)
              ? [{ index: 0, options: question.options }]
              : undefined),
          label,
        ),
      };
    }

    if (question.type === "match") {
      return {
        ...base,
        type: "match",
        matchingItems: getMatchingItems(question.matchingItems, label),
      };
    }

    if (question.type === "trueFalse") {
      if (typeof question.correctAnswer !== "boolean") {
        throw new Error(`${label}: يجب تحديد الإجابة الصحيحة (true أو false)`);
      }
      return {
        ...base,
        type: "trueFalse",
        correctAnswer: question.correctAnswer,
      };
    }

    if (question.type === "fillBlanks") {
      return {
        ...base,
        type: "fillBlanks",
        fillBlanks: getFillBlanks(question.fillBlanks, label),
      };
    }

    if (question.type === "order") {
      return {
        ...base,
        type: "order",
        orders: getOrders(question.orders, label),
      };
    }

    if (question.type === "classify") {
      return {
        ...base,
        type: "classify",
        classify: getClassifyItems(question.classify, label),
      };
    }

    throw new Error(`${label}: نوع السؤال غير مدعوم`);
  });
}
