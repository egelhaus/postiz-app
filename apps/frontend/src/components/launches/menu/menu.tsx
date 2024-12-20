import { FC, MouseEventHandler, useCallback, useMemo, useState } from 'react';
import { useClickOutside } from '@mantine/hooks';
import { useFetch } from '@gitroom/helpers/utils/custom.fetch';
import { deleteDialog } from '@gitroom/react/helpers/delete.dialog';
import { useToaster } from '@gitroom/react/toaster/toaster';
import interClass from '@gitroom/react/helpers/inter.font';
import { useModals } from '@mantine/modals';
import { TimeTable } from '@gitroom/frontend/components/launches/time.table';
import { useCalendar } from '@gitroom/frontend/components/launches/calendar.context';
import { BotPicture } from '@gitroom/frontend/components/launches/bot.picture';
import { CustomerModal } from '@gitroom/frontend/components/launches/customer.modal';
import { Integration } from '@prisma/client';

export const Menu: FC<{
  canEnable: boolean;
  canDisable: boolean;
  canChangeProfilePicture: boolean;
  canChangeNickName: boolean;
  refreshChannel: (
    integration: Integration & { identifier: string }
  ) => () => void;
  id: string;
  mutate: () => void;
  onChange: (shouldReload: boolean) => void;
}> = (props) => {
  const {
    canEnable,
    canDisable,
    id,
    onChange,
    mutate,
    canChangeProfilePicture,
    canChangeNickName,
    refreshChannel
  } = props;
  const fetch = useFetch();
  const { integrations } = useCalendar();
  const toast = useToaster();
  const modal = useModals();
  const [show, setShow] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => {
    setShow(false);
  });

  const findIntegration: any = useMemo(() => {
    return integrations.find((integration) => integration.id === id);
  }, [integrations, id]);

  const changeShow: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      e.stopPropagation();
      setShow(!show);
    },
    [show]
  );

  const disableChannel = useCallback(async () => {
    if (
      !(await deleteDialog(
        'Are you sure you want to disable this channel?',
        'Disable Channel'
      ))
    ) {
      return;
    }
    await fetch('/integrations/disable', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });

    toast.show('Channel Disabled', 'success');
    setShow(false);
    onChange(false);
  }, []);

  const deleteChannel = useCallback(async () => {
    if (
      !(await deleteDialog(
        'Are you sure you want to delete this channel?',
        'Delete Channel'
      ))
    ) {
      return;
    }
    const deleteIntegration = await fetch('/integrations', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });

    if (deleteIntegration.status === 406) {
      toast.show(
        'You have to delete all the posts associated with this channel before deleting it',
        'warning'
      );
      return;
    }

    toast.show('Channel Deleted', 'success');
    setShow(false);
    onChange(true);
  }, []);

  const enableChannel = useCallback(async () => {
    await fetch('/integrations/enable', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });

    toast.show('Channel Enabled', 'success');
    setShow(false);
    onChange(false);
  }, []);

  const editTimeTable = useCallback(() => {
    const findIntegration = integrations.find(
      (integration) => integration.id === id
    );
    modal.openModal({
      classNames: {
        modal: 'w-[100%] max-w-[600px] bg-transparent text-textColor',
      },
      size: '100%',
      withCloseButton: false,
      closeOnEscape: false,
      closeOnClickOutside: false,
      children: <TimeTable integration={findIntegration!} mutate={mutate} />,
    });
    setShow(false);
  }, [integrations]);

  const changeBotPicture = useCallback(() => {
    const findIntegration = integrations.find(
      (integration) => integration.id === id
    );
    modal.openModal({
      classNames: {
        modal: 'w-[100%] max-w-[600px] bg-transparent text-textColor',
      },
      size: '100%',
      withCloseButton: false,
      closeOnEscape: true,
      closeOnClickOutside: true,
      children: (
        <BotPicture
          canChangeProfilePicture={canChangeProfilePicture}
          canChangeNickName={canChangeNickName}
          integration={findIntegration!}
          mutate={mutate}
        />
      ),
    });
    setShow(false);
  }, [integrations]);

  const addToCustomer = useCallback(() => {
    const findIntegration = integrations.find(
      (integration) => integration.id === id
    );

    modal.openModal({
      classNames: {
        modal: 'w-[100%] max-w-[600px] bg-transparent text-textColor',
      },
      size: '100%',
      withCloseButton: false,
      closeOnEscape: true,
      closeOnClickOutside: true,
      children: (
        <CustomerModal
          // @ts-ignore
          integration={findIntegration}
          onClose={() => {
            mutate();
            toast.show('Customer Updated', 'success');
          }}
        />
      ),
    });

    setShow(false);
  }, [integrations]);

  return (
    <div
      className="cursor-pointer relative select-none"
      onClick={changeShow}
      ref={ref}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
      >
        <path
          d="M13.125 12C13.125 12.2225 13.059 12.44 12.9354 12.625C12.8118 12.81 12.6361 12.9542 12.4305 13.0394C12.225 13.1245 11.9988 13.1468 11.7805 13.1034C11.5623 13.06 11.3618 12.9528 11.2045 12.7955C11.0472 12.6382 10.94 12.4377 10.8966 12.2195C10.8532 12.0012 10.8755 11.775 10.9606 11.5695C11.0458 11.3639 11.19 11.1882 11.375 11.0646C11.56 10.941 11.7775 10.875 12 10.875C12.2984 10.875 12.5845 10.9935 12.7955 11.2045C13.0065 11.4155 13.125 11.7016 13.125 12ZM12 6.75C12.2225 6.75 12.44 6.68402 12.625 6.5604C12.81 6.43679 12.9542 6.26109 13.0394 6.05552C13.1245 5.84995 13.1468 5.62375 13.1034 5.40552C13.06 5.1873 12.9528 4.98684 12.7955 4.82951C12.6382 4.67217 12.4377 4.56503 12.2195 4.52162C12.0012 4.47821 11.775 4.50049 11.5695 4.58564C11.3639 4.67078 11.1882 4.81498 11.0646 4.99998C10.941 5.18499 10.875 5.4025 10.875 5.625C10.875 5.92337 10.9935 6.20952 11.2045 6.4205C11.4155 6.63147 11.7016 6.75 12 6.75ZM12 17.25C11.7775 17.25 11.56 17.316 11.375 17.4396C11.19 17.5632 11.0458 17.7389 10.9606 17.9445C10.8755 18.15 10.8532 18.3762 10.8966 18.5945C10.94 18.8127 11.0472 19.0132 11.2045 19.1705C11.3618 19.3278 11.5623 19.435 11.7805 19.4784C11.9988 19.5218 12.225 19.4995 12.4305 19.4144C12.6361 19.3292 12.8118 19.185 12.9354 19C13.059 18.815 13.125 18.5975 13.125 18.375C13.125 18.0766 13.0065 17.7905 12.7955 17.5795C12.5845 17.3685 12.2984 17.25 12 17.25Z"
          fill="#506490"
        />
      </svg>
      {show && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute top-[100%] left-0 p-[8px] px-[20px] bg-fifth flex flex-col gap-[16px] z-[100] rounded-[8px] border border-tableBorder ${interClass} text-nowrap`}
        >
          {canDisable && findIntegration?.refreshNeeded && (
            <div
              className="flex gap-[12px] items-center"
              onClick={refreshChannel(findIntegration!)}
            >
              <div>
                <svg
                  width={18}
                  height={18}
                  viewBox="0 0 32 32"
                  fill="yellow"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.00079 15.9999C3.00343 13.6138 3.95249 11.3262 5.63975 9.63891C7.327 7.95165 9.61465 7.00259 12.0008 6.99995H25.587L24.2933 5.70745C24.1056 5.5198 24.0002 5.26531 24.0002 4.99995C24.0002 4.73458 24.1056 4.48009 24.2933 4.29245C24.4809 4.1048 24.7354 3.99939 25.0008 3.99939C25.2661 3.99939 25.5206 4.10481 25.7083 4.29245L28.7083 7.29245C28.8013 7.38532 28.875 7.49561 28.9253 7.61701C28.9757 7.7384 29.0016 7.86853 29.0016 7.99995C29.0016 8.13136 28.9757 8.26149 28.9253 8.38289C28.875 8.50428 28.8013 8.61457 28.7083 8.70745L25.7083 11.7074C25.5206 11.8951 25.2661 12.0005 25.0008 12.0005C24.7354 12.0005 24.4809 11.8951 24.2933 11.7074C24.1056 11.5198 24.0002 11.2653 24.0002 10.9999C24.0002 10.7346 24.1056 10.4801 24.2933 10.2924L25.587 8.99995H12.0008C10.1449 9.00193 8.36556 9.74007 7.05323 11.0524C5.74091 12.3647 5.00277 14.144 5.00079 15.9999C5.00079 16.2652 4.89543 16.5195 4.70789 16.7071C4.52036 16.8946 4.266 16.9999 4.00079 16.9999C3.73557 16.9999 3.48122 16.8946 3.29368 16.7071C3.10614 16.5195 3.00079 16.2652 3.00079 15.9999ZM28.0008 14.9999C27.7356 14.9999 27.4812 15.1053 27.2937 15.2928C27.1061 15.4804 27.0008 15.7347 27.0008 15.9999C26.9988 17.8559 26.2607 19.6352 24.9483 20.9475C23.636 22.2598 21.8567 22.998 20.0008 22.9999H6.41454L7.70829 21.7074C7.8012 21.6145 7.8749 21.5042 7.92518 21.3828C7.97546 21.2614 8.00134 21.1313 8.00134 20.9999C8.00134 20.8686 7.97546 20.7384 7.92518 20.6171C7.8749 20.4957 7.8012 20.3854 7.70829 20.2924C7.61538 20.1995 7.50508 20.1258 7.38368 20.0756C7.26229 20.0253 7.13218 19.9994 7.00079 19.9994C6.86939 19.9994 6.73928 20.0253 6.61789 20.0756C6.4965 20.1258 6.3862 20.1995 6.29329 20.2924L3.29329 23.2924C3.20031 23.3853 3.12655 23.4956 3.07623 23.617C3.0259 23.7384 3 23.8685 3 23.9999C3 24.1314 3.0259 24.2615 3.07623 24.3829C3.12655 24.5043 3.20031 24.6146 3.29329 24.7074L6.29329 27.7074C6.3862 27.8004 6.4965 27.8741 6.61789 27.9243C6.73928 27.9746 6.86939 28.0005 7.00079 28.0005C7.13218 28.0005 7.26229 27.9746 7.38368 27.9243C7.50508 27.8741 7.61538 27.8004 7.70829 27.7074C7.8012 27.6145 7.8749 27.5042 7.92518 27.3828C7.97546 27.2614 8.00134 27.1313 8.00134 26.9999C8.00134 26.8686 7.97546 26.7384 7.92518 26.6171C7.8749 26.4957 7.8012 26.3854 7.70829 26.2924L6.41454 24.9999H20.0008C22.3869 24.9973 24.6746 24.0482 26.3618 22.361C28.0491 20.6737 28.9981 18.3861 29.0008 15.9999C29.0008 15.7347 28.8954 15.4804 28.7079 15.2928C28.5204 15.1053 28.266 14.9999 28.0008 14.9999Z"
                    fill="yellow"
                  />
                </svg>
              </div>
              <div className="text-[12px]">Refresh channel</div>
            </div>
          )}
          {(canChangeProfilePicture || canChangeNickName) && (
            <div
              className="flex gap-[12px] items-center"
              onClick={changeBotPicture}
            >
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 32 32"
                  fill="none"
                >
                  <path
                    d="M26 4H10C9.46957 4 8.96086 4.21071 8.58579 4.58579C8.21071 4.96086 8 5.46957 8 6V8H6C5.46957 8 4.96086 8.21071 4.58579 8.58579C4.21071 8.96086 4 9.46957 4 10V26C4 26.5304 4.21071 27.0391 4.58579 27.4142C4.96086 27.7893 5.46957 28 6 28H22C22.5304 28 23.0391 27.7893 23.4142 27.4142C23.7893 27.0391 24 26.5304 24 26V24H26C26.5304 24 27.0391 23.7893 27.4142 23.4142C27.7893 23.0391 28 22.5304 28 22V6C28 5.46957 27.7893 4.96086 27.4142 4.58579C27.0391 4.21071 26.5304 4 26 4ZM10 6H26V14.6725L23.9125 12.585C23.5375 12.2102 23.029 11.9997 22.4988 11.9997C21.9685 11.9997 21.46 12.2102 21.085 12.585L11.6713 22H10V6ZM22 26H6V10H8V22C8 22.5304 8.21071 23.0391 8.58579 23.4142C8.96086 23.7893 9.46957 24 10 24H22V26ZM26 22H14.5L22.5 14L26 17.5V22ZM15 14C15.5933 14 16.1734 13.8241 16.6667 13.4944C17.1601 13.1648 17.5446 12.6962 17.7716 12.1481C17.9987 11.5999 18.0581 10.9967 17.9424 10.4147C17.8266 9.83279 17.5409 9.29824 17.1213 8.87868C16.7018 8.45912 16.1672 8.1734 15.5853 8.05764C15.0033 7.94189 14.4001 8.0013 13.8519 8.22836C13.3038 8.45542 12.8352 8.83994 12.5056 9.33329C12.1759 9.82664 12 10.4067 12 11C12 11.7956 12.3161 12.5587 12.8787 13.1213C13.4413 13.6839 14.2044 14 15 14ZM15 10C15.1978 10 15.3911 10.0586 15.5556 10.1685C15.72 10.2784 15.8482 10.4346 15.9239 10.6173C15.9996 10.8 16.0194 11.0011 15.9808 11.1951C15.9422 11.3891 15.847 11.5673 15.7071 11.7071C15.5673 11.847 15.3891 11.9422 15.1951 11.9808C15.0011 12.0194 14.8 11.9996 14.6173 11.9239C14.4346 11.8482 14.2784 11.72 14.1685 11.5556C14.0586 11.3911 14 11.1978 14 11C14 10.7348 14.1054 10.4804 14.2929 10.2929C14.4804 10.1054 14.7348 10 15 10Z"
                    fill="lightgreen"
                  />
                </svg>
              </div>
              <div className="text-[12px]">
                Change Bot{' '}
                {[
                  canChangeProfilePicture && 'Picture',
                  canChangeNickName && 'Nickname',
                ]
                  .filter((f) => f)
                  .join(' / ')}
              </div>
            </div>
          )}
          <div className="flex gap-[12px] items-center" onClick={addToCustomer}>
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                height={18}
                viewBox="0 0 32 32"
                fill="none"
              >
                <path
                  d="M31.9997 17C31.9997 17.2652 31.8943 17.5196 31.7068 17.7071C31.5192 17.8946 31.2649 18 30.9997 18H28.9997V20C28.9997 20.2652 28.8943 20.5196 28.7068 20.7071C28.5192 20.8946 28.2649 21 27.9997 21C27.7345 21 27.4801 20.8946 27.2926 20.7071C27.105 20.5196 26.9997 20.2652 26.9997 20V18H24.9997C24.7345 18 24.4801 17.8946 24.2926 17.7071C24.105 17.5196 23.9997 17.2652 23.9997 17C23.9997 16.7348 24.105 16.4804 24.2926 16.2929C24.4801 16.1054 24.7345 16 24.9997 16H26.9997V14C26.9997 13.7348 27.105 13.4804 27.2926 13.2929C27.4801 13.1054 27.7345 13 27.9997 13C28.2649 13 28.5192 13.1054 28.7068 13.2929C28.8943 13.4804 28.9997 13.7348 28.9997 14V16H30.9997C31.2649 16 31.5192 16.1054 31.7068 16.2929C31.8943 16.4804 31.9997 16.7348 31.9997 17ZM24.7659 24.3562C24.9367 24.5595 25.0197 24.8222 24.9967 25.0866C24.9737 25.351 24.8466 25.5955 24.6434 25.7662C24.4402 25.937 24.1775 26.02 23.9131 25.997C23.6486 25.974 23.4042 25.847 23.2334 25.6437C20.7184 22.6487 17.2609 21 13.4997 21C9.73843 21 6.28093 22.6487 3.76593 25.6437C3.59519 25.8468 3.35079 25.9737 3.08648 25.9966C2.82217 26.0194 2.55961 25.9364 2.35655 25.7656C2.15349 25.5949 2.02658 25.3505 2.00372 25.0862C1.98087 24.8219 2.06394 24.5593 2.23468 24.3562C4.10218 22.1337 6.42468 20.555 9.00593 19.71C7.43831 18.7336 6.23133 17.2733 5.56759 15.5498C4.90386 13.8264 4.81949 11.9337 5.32724 10.1581C5.83499 8.38242 6.90724 6.82045 8.38176 5.70847C9.85629 4.59649 11.6529 3.995 13.4997 3.995C15.3465 3.995 17.1431 4.59649 18.6176 5.70847C20.0921 6.82045 21.1644 8.38242 21.6721 10.1581C22.1799 11.9337 22.0955 13.8264 21.4318 15.5498C20.768 17.2733 19.561 18.7336 17.9934 19.71C20.5747 20.555 22.8972 22.1337 24.7659 24.3562ZM13.4997 19C14.7853 19 16.042 18.6188 17.1109 17.9045C18.1798 17.1903 19.0129 16.1752 19.5049 14.9874C19.9969 13.7997 20.1256 12.4928 19.8748 11.2319C19.624 9.97103 19.0049 8.81284 18.0959 7.9038C17.1868 6.99476 16.0286 6.37569 14.7678 6.12489C13.5069 5.87409 12.2 6.00281 11.0122 6.49478C9.82451 6.98675 8.80935 7.81987 8.09512 8.88879C7.38089 9.95771 6.99968 11.2144 6.99968 12.5C7.00166 14.2233 7.68712 15.8754 8.90567 17.094C10.1242 18.3126 11.7764 18.998 13.4997 19Z"
                  fill="green"
                />
              </svg>
            </div>
            <div className="text-[12px]">Move / add to customer</div>
          </div>
          <div className="flex gap-[12px] items-center" onClick={editTimeTable}>
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 32 32"
                fill="none"
              >
                <path
                  d="M16 5C13.6266 5 11.3066 5.70379 9.33316 7.02236C7.35977 8.34094 5.8217 10.2151 4.91345 12.4078C4.0052 14.6005 3.76756 17.0133 4.23058 19.3411C4.6936 21.6689 5.83649 23.8071 7.51472 25.4853C9.19295 27.1635 11.3312 28.3064 13.6589 28.7694C15.9867 29.2324 18.3995 28.9948 20.5922 28.0866C22.7849 27.1783 24.6591 25.6402 25.9776 23.6668C27.2962 21.6935 28 19.3734 28 17C27.9964 13.8185 26.7309 10.7684 24.4813 8.51874C22.2316 6.26909 19.1815 5.00364 16 5ZM16 27C14.0222 27 12.0888 26.4135 10.4443 25.3147C8.79981 24.2159 7.51809 22.6541 6.76121 20.8268C6.00433 18.9996 5.8063 16.9889 6.19215 15.0491C6.578 13.1093 7.53041 11.3275 8.92894 9.92893C10.3275 8.53041 12.1093 7.578 14.0491 7.19215C15.9889 6.80629 17.9996 7.00433 19.8268 7.7612C21.6541 8.51808 23.2159 9.79981 24.3147 11.4443C25.4135 13.0888 26 15.0222 26 17C25.997 19.6513 24.9425 22.1931 23.0678 24.0678C21.1931 25.9425 18.6513 26.997 16 27ZM21.7075 11.2925C21.8005 11.3854 21.8742 11.4957 21.9246 11.6171C21.9749 11.7385 22.0008 11.8686 22.0008 12C22.0008 12.1314 21.9749 12.2615 21.9246 12.3829C21.8742 12.5043 21.8005 12.6146 21.7075 12.7075L16.7075 17.7075C16.6146 17.8004 16.5043 17.8741 16.3829 17.9244C16.2615 17.9747 16.1314 18.0006 16 18.0006C15.8686 18.0006 15.7385 17.9747 15.6171 17.9244C15.4957 17.8741 15.3854 17.8004 15.2925 17.7075C15.1996 17.6146 15.1259 17.5043 15.0756 17.3829C15.0253 17.2615 14.9994 17.1314 14.9994 17C14.9994 16.8686 15.0253 16.7385 15.0756 16.6171C15.1259 16.4957 15.1996 16.3854 15.2925 16.2925L20.2925 11.2925C20.3854 11.1995 20.4957 11.1258 20.6171 11.0754C20.7385 11.0251 20.8686 10.9992 21 10.9992C21.1314 10.9992 21.2615 11.0251 21.3829 11.0754C21.5043 11.1258 21.6146 11.1995 21.7075 11.2925ZM12 2C12 1.73478 12.1054 1.48043 12.2929 1.29289C12.4804 1.10536 12.7348 1 13 1H19C19.2652 1 19.5196 1.10536 19.7071 1.29289C19.8946 1.48043 20 1.73478 20 2C20 2.26522 19.8946 2.51957 19.7071 2.70711C19.5196 2.89464 19.2652 3 19 3H13C12.7348 3 12.4804 2.89464 12.2929 2.70711C12.1054 2.51957 12 2.26522 12 2Z"
                  fill="green"
                />
              </svg>
            </div>
            <div className="text-[12px]">Edit Time Slots</div>
          </div>
          {canEnable && (
            <div
              className="flex gap-[12px] items-center"
              onClick={enableChannel}
            >
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 32 32"
                  fill="none"
                >
                  <path
                    d="M28.2325 12.8525C27.7612 12.36 27.2738 11.8525 27.09 11.4062C26.92 10.9975 26.91 10.32 26.9 9.66375C26.8813 8.44375 26.8612 7.06125 25.9 6.1C24.9387 5.13875 23.5562 5.11875 22.3363 5.1C21.68 5.09 21.0025 5.08 20.5938 4.91C20.1488 4.72625 19.64 4.23875 19.1475 3.7675C18.285 2.93875 17.305 2 16 2C14.695 2 13.7162 2.93875 12.8525 3.7675C12.36 4.23875 11.8525 4.72625 11.4062 4.91C11 5.08 10.32 5.09 9.66375 5.1C8.44375 5.11875 7.06125 5.13875 6.1 6.1C5.13875 7.06125 5.125 8.44375 5.1 9.66375C5.09 10.32 5.08 10.9975 4.91 11.4062C4.72625 11.8512 4.23875 12.36 3.7675 12.8525C2.93875 13.715 2 14.695 2 16C2 17.305 2.93875 18.2837 3.7675 19.1475C4.23875 19.64 4.72625 20.1475 4.91 20.5938C5.08 21.0025 5.09 21.68 5.1 22.3363C5.11875 23.5562 5.13875 24.9387 6.1 25.9C7.06125 26.8612 8.44375 26.8813 9.66375 26.9C10.32 26.91 10.9975 26.92 11.4062 27.09C11.8512 27.2738 12.36 27.7612 12.8525 28.2325C13.715 29.0613 14.695 30 16 30C17.305 30 18.2837 29.0613 19.1475 28.2325C19.64 27.7612 20.1475 27.2738 20.5938 27.09C21.0025 26.92 21.68 26.91 22.3363 26.9C23.5562 26.8813 24.9387 26.8612 25.9 25.9C26.8612 24.9387 26.8813 23.5562 26.9 22.3363C26.91 21.68 26.92 21.0025 27.09 20.5938C27.2738 20.1488 27.7612 19.64 28.2325 19.1475C29.0613 18.285 30 17.305 30 16C30 14.695 29.0613 13.7162 28.2325 12.8525ZM26.7887 17.7638C26.19 18.3888 25.57 19.035 25.2412 19.8288C24.9262 20.5913 24.9125 21.4625 24.9 22.3062C24.8875 23.1812 24.8738 24.0975 24.485 24.485C24.0963 24.8725 23.1862 24.8875 22.3062 24.9C21.4625 24.9125 20.5913 24.9262 19.8288 25.2412C19.035 25.57 18.3888 26.19 17.7638 26.7887C17.1388 27.3875 16.5 28 16 28C15.5 28 14.8562 27.385 14.2362 26.7887C13.6163 26.1925 12.965 25.57 12.1713 25.2412C11.4088 24.9262 10.5375 24.9125 9.69375 24.9C8.81875 24.8875 7.9025 24.8738 7.515 24.485C7.1275 24.0963 7.1125 23.1862 7.1 22.3062C7.0875 21.4625 7.07375 20.5913 6.75875 19.8288C6.43 19.035 5.81 18.3888 5.21125 17.7638C4.6125 17.1388 4 16.5 4 16C4 15.5 4.615 14.8562 5.21125 14.2362C5.8075 13.6163 6.43 12.965 6.75875 12.1713C7.07375 11.4088 7.0875 10.5375 7.1 9.69375C7.1125 8.81875 7.12625 7.9025 7.515 7.515C7.90375 7.1275 8.81375 7.1125 9.69375 7.1C10.5375 7.0875 11.4088 7.07375 12.1713 6.75875C12.965 6.43 13.6112 5.81 14.2362 5.21125C14.8612 4.6125 15.5 4 16 4C16.5 4 17.1438 4.615 17.7638 5.21125C18.3838 5.8075 19.035 6.43 19.8288 6.75875C20.5913 7.07375 21.4625 7.0875 22.3062 7.1C23.1812 7.1125 24.0975 7.12625 24.485 7.515C24.8725 7.90375 24.8875 8.81375 24.9 9.69375C24.9125 10.5375 24.9262 11.4088 25.2412 12.1713C25.57 12.965 26.19 13.6112 26.7887 14.2362C27.3875 14.8612 28 15.5 28 16C28 16.5 27.385 17.1438 26.7887 17.7638ZM21.7075 12.2925C21.8005 12.3854 21.8742 12.4957 21.9246 12.6171C21.9749 12.7385 22.0008 12.8686 22.0008 13C22.0008 13.1314 21.9749 13.2615 21.9246 13.3829C21.8742 13.5043 21.8005 13.6146 21.7075 13.7075L14.7075 20.7075C14.6146 20.8005 14.5043 20.8742 14.3829 20.9246C14.2615 20.9749 14.1314 21.0008 14 21.0008C13.8686 21.0008 13.7385 20.9749 13.6171 20.9246C13.4957 20.8742 13.3854 20.8005 13.2925 20.7075L10.2925 17.7075C10.1049 17.5199 9.99944 17.2654 9.99944 17C9.99944 16.7346 10.1049 16.4801 10.2925 16.2925C10.4801 16.1049 10.7346 15.9994 11 15.9994C11.2654 15.9994 11.5199 16.1049 11.7075 16.2925L14 18.5863L20.2925 12.2925C20.3854 12.1995 20.4957 12.1258 20.6171 12.0754C20.7385 12.0251 20.8686 11.9992 21 11.9992C21.1314 11.9992 21.2615 12.0251 21.3829 12.0754C21.5043 12.1258 21.6146 12.1995 21.7075 12.2925Z"
                    fill="#06ff00"
                  />
                </svg>
              </div>
              <div className="text-[12px]">Enable Channel</div>
            </div>
          )}

          {canDisable && (
            <div
              className="flex gap-[12px] items-center"
              onClick={disableChannel}
            >
              <div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 32 32"
                  fill="none"
                >
                  <path
                    d="M16 3C13.4288 3 10.9154 3.76244 8.77759 5.1909C6.63975 6.61935 4.97351 8.64968 3.98957 11.0251C3.00563 13.4006 2.74819 16.0144 3.2498 18.5362C3.75141 21.0579 4.98953 23.3743 6.80762 25.1924C8.6257 27.0105 10.9421 28.2486 13.4638 28.7502C15.9856 29.2518 18.5995 28.9944 20.9749 28.0104C23.3503 27.0265 25.3807 25.3603 26.8091 23.2224C28.2376 21.0846 29 18.5712 29 16C28.9964 12.5533 27.6256 9.24882 25.1884 6.81163C22.7512 4.37445 19.4467 3.00364 16 3ZM27 16C27.0026 18.5719 26.0993 21.0626 24.4488 23.035L8.96501 7.55C10.5713 6.21372 12.5249 5.36255 14.5972 5.0961C16.6696 4.82964 18.775 5.15892 20.667 6.04541C22.5591 6.93189 24.1595 8.33891 25.281 10.1018C26.4026 11.8647 26.9988 13.9106 27 16ZM5.00001 16C4.99745 13.4281 5.90069 10.9374 7.55126 8.965L23.035 24.45C21.4288 25.7863 19.4751 26.6374 17.4028 26.9039C15.3304 27.1704 13.225 26.8411 11.333 25.9546C9.44096 25.0681 7.84053 23.6611 6.71899 21.8982C5.59745 20.1353 5.0012 18.0894 5.00001 16Z"
                    fill="#F97066"
                  />
                </svg>
              </div>
              <div className="text-[12px]">Disable Channel</div>
            </div>
          )}

          <div className="flex gap-[12px] items-center" onClick={deleteChannel}>
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M13.5 3H11V2.5C11 2.10218 10.842 1.72064 10.5607 1.43934C10.2794 1.15804 9.89782 1 9.5 1H6.5C6.10218 1 5.72064 1.15804 5.43934 1.43934C5.15804 1.72064 5 2.10218 5 2.5V3H2.5C2.36739 3 2.24021 3.05268 2.14645 3.14645C2.05268 3.24021 2 3.36739 2 3.5C2 3.63261 2.05268 3.75979 2.14645 3.85355C2.24021 3.94732 2.36739 4 2.5 4H3V13C3 13.2652 3.10536 13.5196 3.29289 13.7071C3.48043 13.8946 3.73478 14 4 14H12C12.2652 14 12.5196 13.8946 12.7071 13.7071C12.8946 13.5196 13 13.2652 13 13V4H13.5C13.6326 4 13.7598 3.94732 13.8536 3.85355C13.9473 3.75979 14 3.63261 14 3.5C14 3.36739 13.9473 3.24021 13.8536 3.14645C13.7598 3.05268 13.6326 3 13.5 3ZM6 2.5C6 2.36739 6.05268 2.24021 6.14645 2.14645C6.24021 2.05268 6.36739 2 6.5 2H9.5C9.63261 2 9.75979 2.05268 9.85355 2.14645C9.94732 2.24021 10 2.36739 10 2.5V3H6V2.5ZM12 13H4V4H12V13ZM7 6.5V10.5C7 10.6326 6.94732 10.7598 6.85355 10.8536C6.75979 10.9473 6.63261 11 6.5 11C6.36739 11 6.24021 10.9473 6.14645 10.8536C6.05268 10.7598 6 10.6326 6 10.5V6.5C6 6.36739 6.05268 6.24021 6.14645 6.14645C6.24021 6.05268 6.36739 6 6.5 6C6.63261 6 6.75979 6.05268 6.85355 6.14645C6.94732 6.24021 7 6.36739 7 6.5ZM10 6.5V10.5C10 10.6326 9.94732 10.7598 9.85355 10.8536C9.75979 10.9473 9.63261 11 9.5 11C9.36739 11 9.24021 10.9473 9.14645 10.8536C9.05268 10.7598 9 10.6326 9 10.5V6.5C9 6.36739 9.05268 6.24021 9.14645 6.14645C9.24021 6.05268 9.36739 6 9.5 6C9.63261 6 9.75979 6.05268 9.85355 6.14645C9.94732 6.24021 10 6.36739 10 6.5Z"
                  fill="#F97066"
                />
              </svg>
            </div>
            <div className="text-[12px]">Delete</div>
          </div>
        </div>
      )}
    </div>
  );
};
