import { GridColumnHeaderParams } from "@mui/x-data-grid";
import React from "react";
import { useTranslation } from "react-i18next";

export const TranslateLanguage = (params: GridColumnHeaderParams) => {
  const { t } = useTranslation();
  const header = params.colDef.headerName!
  return (
    <>{t(header)}</>
  );
};
