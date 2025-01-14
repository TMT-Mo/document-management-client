import { CircularProgress, Divider } from "@mui/material";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import WebViewer from "@pdftron/webviewer";
import AlertPopup from "components/AlertPopup";
import { useDispatch, useSelector, useSignalR } from "hooks";
import { useTranslation } from "react-i18next";
import { SaveLoadingBtn, TextFieldStyled } from "components/CustomStyled";
import { createDocument } from "slices/document";
import { handleError } from "slices/alert";
import { DeviceWidth } from "utils/constants";

const ViewCreateDocument: React.FC = () => {
  const viewer = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { templateDetail } = useSelector((state) => state.template);
  const { isCreateDocumentLoading } = useSelector((state) => state.document);
  const { userInfo } = useSelector((state) => state.auth);
  const { sendSignalNotification } = useSignalR();
  const {
    departmentName,
    description,
    templateName,
    typeName,
    link,
    id,
    signatoryList,
    isEnable,
  } = templateDetail!;
  const [purpose, setPurpose] = useState("");
  const [xfdfString, setXfdfString] = useState<string | undefined>();
  const { t, i18n } = useTranslation();

  const signers = signatoryList.map((signer, index) => (
    <div
      className="flex flex-col space-y-3 rounded-md border border-solid border-white p-4"
      key={index}
    >
      <div className="flex space-x-2 items-center ">
        <h4>{t("Signer")}:</h4>
        <span className="text-white text-base break-words">
          {signer.userName}
        </span>
      </div>
      <div className="flex space-x-2 items-center">
        <h4>{t("Department")}:</h4>
        <span className="text-white text-base break-words">
          {signer.departmentName}
        </span>
      </div>
      <div className="flex space-x-2 items-center">
        <h4>{t("Role")}:</h4>
        <span className="text-white text-base break-words">
          {signer.roleName}
        </span>
      </div>
    </div>
  ));
  // if using a class, equivalent of componentDidMount

  useEffect(() => {
    WebViewer(
      {
        path: "/webviewer/lib",
        initialDoc: link!,
        disabledElements: [
          "toolbarGroup-Forms",
          "downloadButton",
          "languageButton",
          "signatureToolGroupButton",
        ],
        annotationUser: userInfo?.userId!.toString(),
      },
      viewer.current!
    ).then(async (instance) => {
      const { documentViewer, annotationManager } = instance.Core;
      instance.UI.setLanguage(i18n.language === "vn" ? "vi" : "en");
      window.innerWidth < DeviceWidth.IPAD_WIDTH && instance.UI.disableElements([ 'textSelectButton', 'panToolButton' ]);
      instance.UI.setHeaderItems(function (header) {
        header.push({
          type: "actionButton",
          img: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 20 20"><path d="M19 9h-4V3H9v6H5l7 8zM4 19h16v2H4z"></path></svg>',
          onClick: async () =>
            await instance.UI.downloadPdf({
              filename: templateName.replace(/.docx|.doc/g, ""),
              includeAnnotations: false,
            }),
        });
      });
      documentViewer.addEventListener("documentLoaded", async () => {
        await documentViewer.getDocument().getDocumentCompletePromise();
        documentViewer.updateView();
        // documentViewer.addEventListener("annotationsLoaded", () => {
        //   const annot = new Annotations.FreeTextAnnotation(
        //     Annotations.FreeTextAnnotation.Intent.FreeText,
        //     {
        //       PageNumber: 1,
        //       TextColor: new Annotations.Color(255, 0, 0, 1),
        //       StrokeColor: new Annotations.Color(0, 255, 0, 0),
        //     }
        //   );
        //   annot.ReadOnly = true;
        //   annot.setPathPoint(0, 300, 20); // Callout ending (start)
        //   // annot.setPathPoint(1, 425, 75);  // Callout knee
        //   // annot.setPathPoint(2, 300, 75);  // Callout joint
        //   // annot.setPathPoint(3, 100, 50);  // Top-left point
        //   // annot.setPathPoint(4, 300, 100); // Bottom-right point

        //   annot.setContents(`${typeName}_${departmentName}_1`);
        //   annot.Author = uuidv4();

        //   annotationManager.addAnnotation(annot);
        //   annotationManager.redrawAnnotation(annot);
        // });
        annotationManager.setAnnotationDisplayAuthorMap((userId) => {
          if (userId === userInfo?.userId!.toString()) {
            return userInfo?.userName!;
          }
          return "System";
        });
        annotationManager.addEventListener(
          "annotationChanged",
          async (annotations, action) => {
            const annots = (
              await annotationManager.exportAnnotations({
                useDisplayAuthor: true,
              })
            ).replaceAll(/\\&quot;/gi, "");
            setXfdfString(annots);
          }
        );
      });
    });
  }, [
    departmentName,
    link,
    templateName,
    typeName,
    userInfo?.userId,
    userInfo?.userName,
    i18n.language,
  ]);

  const onCreateDocument = async () => {
    if(!xfdfString){
      dispatch(handleError({errorMessage: t('Please edit something before creating a new document')}))
      return
    }
    await dispatch(
      createDocument({
        createdBy: +userInfo?.userId!,
        idTemplate: id,
        xfdfString: xfdfString!,
        documentDescription: purpose!,
      })
    ).unwrap();
    sendSignalNotification({
      userIds: [signatoryList[0].id],
      notify: {
        isChecked: false,
        description: `You have a new document waiting for an approval!`,
      },
    });
    navigate("/user", { replace: true });
  };

  return (
    <Fragment>
      <div className="bg-blue-config px-20 py-6 flex space-x-4 items-center">
        <Link to="/user">
          <ArrowBackIosIcon fontSize="small" className="fill-white" />
        </Link>
        <span className="text-white">{t("Create await signing document")}</span>
      </div>
      <div className="flex flex-col-reverse md:flex-row">
        <div className="flex flex-col bg-dark-config min-h-screen px-10 pt-12 space-y-8 md:w-80">
          <div className="flex flex-col space-y-8 text-white">
            <div className="flex flex-col space-y-2">
              <h4 className="whitespace-nowrap">{t("File name")}:</h4>
              <span className="text-white text-base break-words w-60">
                {templateName}
              </span>
            </div>

            <div className="flex flex-col space-y-2">
              <h4 className="whitespace-nowrap">{t("Description")}:</h4>
              <span className="text-white text-base break-words w-60">
                {description}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <h4 className="whitespace-nowrap">{t("Type")}:</h4>
              <span className="text-white text-base break-words w-60">
                {typeName}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <h4 className="whitespace-nowrap">{t("Department")}:</h4>
              <span className="text-white text-base break-words w-60">
                {departmentName}
              </span>
            </div>
            <div className="flex flex-col space-y-3">
              <h4 className="whitespace-nowrap">
                {t("Describe the purpose of use")}:
              </h4>
              <TextFieldStyled
                sx={{
                  border: "1px solid #fff",
                  borderRadius: 1,
                  ".MuiInputBase-input": { color: "#fff" },
                }}
                multiline
                rows={4}
                onChange={(value) => {
                  if (value.target.value.length > 100) return;
                  setPurpose(value.target.value);
                }}
                value={purpose}
              />
              <h4>{t("Maximum length")}: 100</h4>
            </div>
            <Divider className="bg-white" />
            <div className="flex justify-center">
              <h4 className="whitespace-nowrap">{t("Signer List")}:</h4>
            </div>
            {signers}
            {isEnable && (
              <SaveLoadingBtn
                size="small"
                loading={isCreateDocumentLoading}
                loadingIndicator={
                  <CircularProgress color="inherit" size={16} />
                }
                variant="outlined"
                onClick={onCreateDocument}
                disabled={!purpose}
              >
                {t("Send")}
              </SaveLoadingBtn>
            )}
          </div>
        </div>
        <div className="webviewer w-full h-screen" ref={viewer}></div>
      </div>
      <AlertPopup
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={3000}
      />
    </Fragment>
  );
};

export default ViewCreateDocument;
